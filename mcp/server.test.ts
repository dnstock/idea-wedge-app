import test from 'node:test';
import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from './server';
import { createIdea, assessIdea, gates, type Repository } from './service';
import { connectRepository } from './repository';

const id = 'fa1aa1be-a7d3-4f6f-8888-aabbaa112233';
const input = { request_id: id, idea_name: 'Support triage', summary: 'Prioritize incoming support tickets', buyer: 'Support leads', problem: 'Urgent tickets get lost' };
function fixture() {
  const rows: Record<string, unknown>[] = [];
  const repo: Repository = {
    user: { id: 'user-one', name: 'Test user' },
    async find(selector) { return rows.filter(row => row.id === selector || row.idea_name === selector); },
    async insert(row) {
      const existing = rows.find(item => item.id === row.id);
      if (existing) {
        if (!Object.entries(row).every(([key, value]) => existing[key] === value)) throw new Error('Conflicting submission');
        return { row: existing, created: false };
      }
      const saved = { ...row, updated_at: '2026-09-29T12:00:00Z' };
      rows.push(saved);
      return { row: saved, created: true };
    },
  };
  return { rows, repo };
}
function ratings(value: 'strong' | 'medium' | 'weak' | 'unknown') {
  return Object.fromEntries(Object.keys(gates).map(gate => [gate, {
    rating: value, rationale: 'Test rationale', evidence: value === 'unknown' ? [] : [{ field: 'summary', quote: input.summary }], next_step: 'Validate with buyers',
  }]));
}
test('create saves an unassessed backlog entry under authenticated identity and deduplicates retries', async () => {
  const { repo, rows } = fixture();
  assert.equal((await createIdea(repo, input)).created, true);
  assert.equal((await createIdea(repo, input)).created, false);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].user_id, 'user-one');
  assert.equal(rows[0].decision, null);
  assert.equal(rows[0].status, 'backlog');
  assert.equal(rows[0].market_score, 'unknown');
  await assert.rejects(createIdea(repo, { ...input, summary: 'different' }));
  await assert.rejects(createIdea(repo, { ...input, user_id: 'someone-else' }));
  await assert.rejects(createIdea(repo, { ...input, idea_name: ' ' }));
});
test('assessment reads saved idea and applies shared gate rules without writes', async () => {
  const { repo, rows } = fixture();
  await createIdea(repo, input);
  const snapshot = JSON.stringify(rows);
  const initial = await assessIdea(repo, { idea: id });
  assert.equal(initial.status, 'ready_for_assessment');
  for (const [rating, score, verdict] of [['strong', 100, 'Approve'], ['medium', 60, 'Defer'], ['weak', 20, 'Reject'], ['unknown', 0, 'Reject']] as const) {
    const result = await assessIdea(repo, { idea: id, expected_updated_at: rows[0].updated_at, ratings: ratings(rating) });
    assert.equal(result.overall_score, score);
    assert.equal(result.verdict?.label, verdict);
    assert.equal(result.saved, false);
  }
  assert.equal(JSON.stringify(rows), snapshot);
});
test('freshness and evidence failures cannot produce a fresh assessment', async () => {
  const { repo, rows } = fixture();
  await createIdea(repo, input);
  await assert.rejects(assessIdea(repo, { idea: id, ratings: ratings('strong') }), /changed/);
  await assert.rejects(assessIdea(repo, { idea: id, expected_updated_at: 'old', ratings: ratings('strong') }), /changed/);
  const bad = ratings('strong');
  bad.market.evidence[0].quote = 'invented evidence';
  await assert.rejects(assessIdea(repo, { idea: id, expected_updated_at: rows[0].updated_at, ratings: bad }), /quote/);
  bad.market.evidence = [];
  await assert.rejects(assessIdea(repo, { idea: id, expected_updated_at: rows[0].updated_at, ratings: bad }), /requires evidence/);
  await assert.rejects(assessIdea(repo, { idea: 'missing' }), /not found/);
});
test('ambiguous names require selection and malformed historical scores become unknown', async () => {
  const { repo, rows } = fixture();
  await createIdea(repo, input);
  rows[0].market_score = 'invalid';
  assert.equal((await assessIdea(repo, { idea: id })).overall_score, 0);
  rows.push({ ...rows[0], id: 'another-id' });
  const result = await assessIdea(repo, { idea: input.idea_name });
  assert.equal(result.status, 'ambiguous');
  assert.equal(result.candidates?.length, 2);
});
test('MCP handshake, tool discovery, validation and tool calls work through SDK transports', async () => {
  const { repo } = fixture();
  const server = createServer(async () => repo);
  const client = new Client({ name: 'test', version: '1.0.0' });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  try {
    const tools = await client.listTools();
    assert.deepEqual(tools.tools.map(tool => tool.name).sort(), ['assess_saved_idea', 'create_idea']);
    assert.equal((await client.callTool({ name: 'create_idea', arguments: input })).isError, undefined);
    const result = await client.callTool({ name: 'assess_saved_idea', arguments: { idea: id } });
    assert.equal(result.isError, undefined);
    const invalid = await client.callTool({ name: 'create_idea', arguments: { idea_name: 'missing fields' } });
    assert.equal(invalid.isError, true);
    assert.equal((await client.callTool({ name: 'assess_saved_idea', arguments: { idea: 'missing' } })).isError, true);
  } finally { await client.close(); await server.close(); }
});
test('missing configuration, insecure endpoints and service credentials are rejected', async () => {
  await assert.rejects(connectRepository({}), /Configure/);
  const env = { IDEA_WEDGE_SUPABASE_URL: 'http://example.com', IDEA_WEDGE_SUPABASE_ANON_KEY: 'public', IDEA_WEDGE_ACCESS_TOKEN: 'user-token' };
  await assert.rejects(connectRepository(env), /HTTPS/);
  env.IDEA_WEDGE_SUPABASE_URL = 'https://example.com';
  env.IDEA_WEDGE_SUPABASE_ANON_KEY = 'sb_secret_example';
  await assert.rejects(connectRepository(env), /never a secret/);
  env.IDEA_WEDGE_SUPABASE_ANON_KEY = 'public';
  env.IDEA_WEDGE_ACCESS_TOKEN = `header.${Buffer.from(JSON.stringify({ role: 'service_role' })).toString('base64url')}.signature`;
  await assert.rejects(connectRepository(env), /Service-role/);
});
test('Supabase adapter authenticates each connection, forwards user token, and handles real retry path', async t => {
  const token = 'test-user-session';
  const env = { IDEA_WEDGE_SUPABASE_URL: 'https://example.supabase.co', IDEA_WEDGE_SUPABASE_ANON_KEY: 'public-key', IDEA_WEDGE_ACCESS_TOKEN: token };
  let saved: Record<string, unknown> | undefined;
  const calls: string[] = [];
  t.mock.method(globalThis, 'fetch', async (url: string | URL | Request, init?: RequestInit) => {
    const path = String(url);
    calls.push(path);
    assert.equal(new Headers(init?.headers).get('authorization'), `Bearer ${token}`);
    const response = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json' } });
    if (path.includes('/auth/v1/user')) return response({ id: 'user-one', user_metadata: { full_name: 'Test user' } });
    if (init?.method === 'POST') {
      if (saved) return response({ code: '23505', message: 'duplicate' }, 409);
      saved = { ...JSON.parse(String(init.body)), updated_at: '2026-09-29T12:00:00Z' };
      return response(saved, 201);
    }
    if (new Headers(init?.headers).get('accept')?.includes('vnd.pgrst.object')) return response(saved);
    return response([saved]);
  });
  const repo = await connectRepository(env);
  assert.equal((await createIdea(repo, input)).created, true);
  assert.equal((await createIdea(repo, input)).created, false);
  await assert.rejects(createIdea(repo, { ...input, summary: 'changed' }), /different or changed/);
  assert.equal((await repo.find(input.idea_name)).length, 1);
  assert.equal(calls[0], 'https://example.supabase.co/auth/v1/user');
  assert.ok(calls.some(url => url.includes('idea_name=eq.Support')));
});
test('invalid user session stops before any database operation', async t => {
  const calls: string[] = [];
  t.mock.method(globalThis, 'fetch', async (url: unknown) => {
    calls.push(String(url));
    return new Response(JSON.stringify({ message: 'invalid token' }), { status: 401, headers: { 'content-type': 'application/json' } });
  });
  await assert.rejects(connectRepository({ IDEA_WEDGE_SUPABASE_URL: 'https://example.supabase.co', IDEA_WEDGE_SUPABASE_ANON_KEY: 'public-key', IDEA_WEDGE_ACCESS_TOKEN: 'expired-token' }), /Sign in/);
  assert.equal(calls.length, 1);
  assert.ok(calls[0].endsWith('/auth/v1/user'));
});
