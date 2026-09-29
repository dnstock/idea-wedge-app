import { createClient } from '@supabase/supabase-js';
import type { Repository } from './service';

export async function connectRepository(env = process.env): Promise<Repository> {
  const url = env.IDEA_WEDGE_SUPABASE_URL || env.VITE_SUPABASE_URL;
  const key = env.IDEA_WEDGE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;
  const token = env.IDEA_WEDGE_ACCESS_TOKEN;
  if (!url || !key || !token) throw new Error('Configure the Supabase URL, public key and IDEA_WEDGE_ACCESS_TOKEN (a signed-in user session).');
  const endpoint = new URL(url);
  if (endpoint.protocol !== 'https:' && !(endpoint.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(endpoint.hostname))) throw new Error('Supabase must use HTTPS, except on localhost.');
  if (key.startsWith('sb_secret_')) throw new Error('Use the public Supabase key, never a secret or service-role key.');
  for (const credential of [key, token]) {
    try {
      const payload = JSON.parse(Buffer.from(credential.split('.')[1] || '', 'base64url').toString());
      if (payload.role === 'service_role') throw new Error('Service-role credentials are not allowed.');
    } catch (error) {
      if (error instanceof Error && error.message === 'Service-role credentials are not allowed.') throw error;
    }
  }
  const client = createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) throw new Error('Sign in to Idea Wedge and configure a current user access token.');
  const user = { id: data.user.id, name: String(data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email || 'Idea Wedge user') };
  return {
    user,
    async find(selector) {
      const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(selector);
      const result = await client.from('idea_reviews').select('*').eq(isId ? 'id' : 'idea_name', selector).limit(10);
      if (result.error) throw new Error('Could not read ideas. Check your connection and access permissions.');
      return result.data;
    },
    async insert(row) {
      const result = await client.from('idea_reviews').insert(row).select().single();
      if (!result.error) return { row: result.data, created: true };
      if (result.error.code === '23505') {
        const previous = await client.from('idea_reviews').select('*').eq('id', row.id).single();
        if (previous.data && Object.entries(row).every(([field, value]) => previous.data[field] === value)) return { row: previous.data, created: false };
        throw new Error('This request ID belongs to a different or changed submission. Do not overwrite it.');
      }
      throw new Error('Could not save the idea. Check your connection and access permissions; retry with the same request_id.');
    },
  };
}
