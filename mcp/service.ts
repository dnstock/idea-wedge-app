import { z } from 'zod';
import { getOverallScore, getVerdict } from '../src/lib/scoring';
import { mapDbReview } from '../src/lib/mappers';

export const textFields = ['idea_name', 'summary', 'buyer', 'problem', 'owner_name', 'tags', 'category', 'competitors', 'proof', 'improvement', 'evidence', 'core', 'out_of_scope', 'complexity', 'channel', 'message', 'proof_point', 'dependencies', 'kill_shot', 'mitigation'] as const;
export const gates = {
  market: { score: 'marketScore', fields: ['category', 'competitors', 'proof'], question: 'Is there an existing buying category with evidence that customers pay?' },
  wedge: { score: 'wedgeScore', fields: ['problem', 'improvement', 'evidence'], question: 'Is there a specific improvement and evidence buyers care?' },
  mvp: { score: 'mvpScore', fields: ['core', 'out_of_scope', 'complexity'], question: 'Is the smallest sellable product bounded and feasible, including migration, permissions, QA and operations?' },
  distribution: { score: 'distributionScore', fields: ['buyer', 'channel', 'message', 'proof_point'], question: 'Is the first buyer, acquisition channel, message and proof point credible?' },
  risk: { score: 'riskScore', fields: ['dependencies', 'kill_shot', 'mitigation'], question: 'Are structural dependencies understood and survivable? Strong means well mitigated risk.' },
} as const;
const score = z.enum(['strong', 'medium', 'weak', 'unknown']);
const shortText = z.string().trim().min(1).max(300);
const longText = z.string().trim().max(12000);
const optionalTextFields = Object.fromEntries(textFields.map(field => [field, longText.optional()])) as Record<(typeof textFields)[number], z.ZodOptional<z.ZodString>>;
export const createSchema = z.object({
  ...optionalTextFields,
  request_id: z.string().uuid().describe('Generate a UUID once per submission; reuse it for retries.'),
  idea_name: shortText,
  summary: longText.min(1),
  buyer: longText.min(1),
  problem: longText.min(1),
}).strict();
const rating = z.object({
  rating: score,
  rationale: z.string().trim().min(1).max(3000),
  evidence: z.array(z.object({ field: z.enum(textFields), quote: z.string().min(1).max(3000) }).strict()).max(10),
  next_step: z.string().trim().min(1).max(2000),
}).strict();
export const assessSchema = z.object({
  idea: shortText.describe('Saved idea UUID or exact name. Ambiguous names return candidate IDs.'),
  expected_updated_at: z.string().optional().describe('Required when providing ratings; use the timestamp returned by the first call.'),
  ratings: z.object({ market: rating, wedge: rating, mvp: rating, distribution: rating, risk: rating }).strict().optional(),
}).strict();
export interface Repository {
  user: { id: string; name: string };
  find(selector: string): Promise<Record<string, unknown>[]>;
  insert(row: Record<string, unknown>): Promise<{ row: Record<string, unknown>; created: boolean }>;
}
export async function createIdea(repo: Repository, raw: unknown) {
  const input = createSchema.parse(raw);
  const row: Record<string, unknown> = {
    id: input.request_id, user_id: repo.user.id, author_name: repo.user.name,
    status: 'backlog', is_demo: false, decision: null, overall_score: 0,
    market_score: 'unknown', wedge_score: 'unknown', mvp_score: 'unknown', distribution_score: 'unknown', risk_score: 'unknown',
  };
  for (const field of textFields) row[field] = input[field] ?? '';
  const result = await repo.insert(row);
  return { ...result, message: result.created ? 'Idea saved. It has not been assessed.' : 'This submission was already saved.' };
}
export async function assessIdea(repo: Repository, raw: unknown) {
  const input = assessSchema.parse(raw);
  const rows = await repo.find(input.idea);
  if (!rows.length) throw new Error('Idea not found or not accessible.');
  if (rows.length > 1) return { status: 'ambiguous', candidates: rows.map(row => ({ id: row.id, idea_name: row.idea_name })), message: 'Choose an idea ID before assessing.' };
  const row = rows[0];
  const review = mapDbReview(row);
  for (const gate of Object.values(gates)) review[gate.score] = score.catch('unknown').parse(review[gate.score]);
  if (input.ratings) {
    if (!input.expected_updated_at || input.expected_updated_at !== row.updated_at) throw new Error('The idea may have changed. Read it again and reassess the current version.');
    for (const [name, gate] of Object.entries(gates)) {
      const evaluation = input.ratings[name as keyof typeof gates];
      if (evaluation.rating !== 'unknown' && !evaluation.evidence.length) throw new Error(`${name}: a known rating requires evidence from the saved idea.`);
      for (const item of evaluation.evidence) {
        if (typeof row[item.field] !== 'string' || !(row[item.field] as string).includes(item.quote)) throw new Error(`${name}: evidence must quote a saved field exactly.`);
      }
      review[gate.score] = evaluation.rating;
    }
  }
  return {
    status: input.ratings ? 'assessed' : 'ready_for_assessment',
    idea: row,
    assessment_source: input.ratings ? 'Agent evaluation of saved content; source claims are not independently verified.' : 'Saved ratings only; these are not a fresh assessment.',
    overall_score: getOverallScore(review), verdict: getVerdict(review),
    ratings: input.ratings ?? Object.fromEntries(Object.entries(gates).map(([name, gate]) => [name, review[gate.score]])),
    rubric: gates,
    scoring: 'Strong=100, medium=60, weak=20, unknown=0; rounded equal-weight average. Market, wedge or MVP weak/unknown => Reject; distribution or risk weak/unknown => Defer; all gates medium/strong and average >=75 => Approve; otherwise Defer. Unknown means missing evidence, not demonstrated failure.',
    saved: false,
  };
}
