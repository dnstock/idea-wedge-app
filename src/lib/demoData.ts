import type { ReviewComment, ReviewRecord } from '../types';

export function createEmptyReview(authorName = ''): ReviewRecord {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    userId: null,
    authorName,
    ideaName: '',
    summary: '',
    ownerName: '',
    status: 'researching',
    tags: '',
    category: '',
    competitors: '',
    proof: '',
    marketScore: 'unknown',
    problem: '',
    improvement: '',
    evidence: '',
    wedgeScore: 'unknown',
    core: '',
    outOfScope: '',
    complexity: '',
    mvpScore: 'unknown',
    buyer: '',
    channel: '',
    message: '',
    proofPoint: '',
    distributionScore: 'unknown',
    dependencies: '',
    killShot: '',
    mitigation: '',
    riskScore: 'unknown',
    decision: null,
    overallScore: 0,
    isDemo: false,
  };
}

export const seededReviews: ReviewRecord[] = [];
export const seededComments: Record<string, ReviewComment[]> = {};
