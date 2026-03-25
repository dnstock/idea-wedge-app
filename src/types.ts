import { TAB_KEYS } from './config';

export type ScoreValue = 'strong' | 'medium' | 'weak' | 'unknown';
export type ReviewStatus = 'backlog' | 'researching' | 'approved' | 'deferred' | 'rejected' | 'building';
export type DecisionLabel = 'Approve' | 'Defer' | 'Reject';

export interface ReviewRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  userId: string | null;
  authorName: string;
  ideaName: string;
  summary: string;
  ownerName: string;
  status: ReviewStatus;
  tags: string;
  category: string;
  competitors: string;
  proof: string;
  marketScore: ScoreValue;
  problem: string;
  improvement: string;
  evidence: string;
  wedgeScore: ScoreValue;
  core: string;
  outOfScope: string;
  complexity: string;
  mvpScore: ScoreValue;
  buyer: string;
  channel: string;
  message: string;
  proofPoint: string;
  distributionScore: ScoreValue;
  dependencies: string;
  killShot: string;
  mitigation: string;
  riskScore: ScoreValue;
  decision: DecisionLabel | null;
  overallScore: number;
  isDemo: boolean | false;
}

export interface ReviewComment {
  id: string;
  createdAt: string;
  reviewId: string;
  userId: string | null;
  authorName: string;
  body: string;
}

export interface UserProfile {
  id: string;
  email: string | null;
  displayName: string;
  avatarUrl: string | null;
}

export interface Verdict {
  label: DecisionLabel;
  tone: 'success' | 'warning' | 'destructive';
  reason: string;
}

export type TabKey = (typeof TAB_KEYS)[number];
