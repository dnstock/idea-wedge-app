import type { ReviewComment, ReviewRecord } from '../types';
import { getOverallScore, getVerdict } from './scoring';

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
  };
}

function finalizeReview(review: ReviewRecord): ReviewRecord {
  const overallScore = getOverallScore(review);
  const decision = getVerdict(review).label;
  return { ...review, overallScore, decision };
}

export const seededReviews: ReviewRecord[] = [
  finalizeReview({
    ...createEmptyReview('Dan'),
    id: 'demo-1',
    ideaName: 'Vertical documentation tool',
    summary: 'A documentation tool for SaaS teams that want AI-friendly product docs without enterprise bloat.',
    ownerName: 'Dan',
    status: 'researching',
    tags: 'docs, b2b, ai-discovery',
    category: 'Documentation / knowledge base SaaS',
    competitors: 'GitBook, Document360, Help Scout Docs, Slab',
    proof: 'Clear pricing pages, active review presence, steady search demand for alternatives and migration help.',
    marketScore: 'strong',
    problem: 'Current tools are either too bloated, too expensive, or weak for public product documentation.',
    improvement: 'A simpler, more opinionated docs product optimized for discoverability, speed, and AI readability.',
    evidence: 'Repeated complaints about pricing, clunky editing, and publishing friction.',
    wedgeScore: 'strong',
    core: 'Structured doc publishing, navigation, search, changelog pages, and public hosting.',
    outOfScope: 'Complex permissions, deep analytics, enterprise workflows.',
    complexity: 'Search quality and migration imports could expand scope if not constrained.',
    mvpScore: 'medium',
    buyer: 'Founders, product marketers, and devrel teams at 10-200 person SaaS companies.',
    channel: 'SEO and founder-led outbound',
    message: 'Ship clearer product docs without enterprise bloat or overpriced seats.',
    proofPoint: 'Live example docs site and competitor teardown.',
    distributionScore: 'medium',
    dependencies: 'Hosting and search vendor, but limited platform dependency.',
    killShot: 'Large incumbents could copy positioning, though not instantly.',
    mitigation: 'Keep scope tight and differentiate on workflow speed and publishing quality.',
    riskScore: 'medium',
  }),
  finalizeReview({
    ...createEmptyReview('Team'),
    id: 'demo-2',
    ideaName: 'Consumer app dependent on one platform API',
    summary: 'An automation layer built almost entirely on top of one third-party social platform API.',
    ownerName: 'Team',
    status: 'deferred',
    tags: 'consumer, platform-risk',
    category: 'Social automation',
    competitors: 'Several niche tools exist, but many have fragile histories.',
    proof: 'Users pay today, but ecosystem health is unstable.',
    marketScore: 'medium',
    problem: 'Users want easier automation and scheduling.',
    improvement: 'Cleaner UX and bundled workflows.',
    evidence: 'Complaints about complexity and churn among existing tools.',
    wedgeScore: 'medium',
    core: 'Simple campaign builder and account management.',
    outOfScope: 'Agency features and team workflows.',
    complexity: 'Moderate.',
    mvpScore: 'medium',
    buyer: 'Solo creators and small teams.',
    channel: 'Influencer content and paid social.',
    message: 'Manage social automation with less friction.',
    proofPoint: 'Demo videos and templates.',
    distributionScore: 'medium',
    dependencies: 'One major API provider and its policy surface.',
    killShot: 'API policy or pricing change can wipe out the product.',
    mitigation: 'Very limited unless product broadens beyond the platform.',
    riskScore: 'weak',
  }),
];

export const seededComments: Record<string, ReviewComment[]> = {
  'demo-1': [
    {
      id: crypto.randomUUID(),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      reviewId: 'demo-1',
      userId: null,
      authorName: 'Matt',
      body: 'The wedge makes sense, but I would force us to prove a sharper first channel before approval.',
    },
  ],
  'demo-2': [
    {
      id: crypto.randomUUID(),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      reviewId: 'demo-2',
      userId: null,
      authorName: 'Kevin',
      body: 'The platform kill-shot is too obvious. I would treat this as a learning exercise, not a company candidate.',
    },
  ],
};
