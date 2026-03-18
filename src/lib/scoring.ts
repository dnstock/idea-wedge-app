import type { ReviewRecord, ScoreValue, Verdict } from '../types';

export const scoreToNumber: Record<ScoreValue, number> = {
  strong: 100,
  medium: 60,
  weak: 20,
  unknown: 0,
};

export const scoreToLabel: Record<ScoreValue, string> = {
  strong: 'Strong',
  medium: 'Medium',
  weak: 'Weak',
  unknown: 'Unknown',
};

export function getOverallScore(review: Pick<ReviewRecord, 'marketScore' | 'wedgeScore' | 'mvpScore' | 'distributionScore' | 'riskScore'>): number {
  const scores = [review.marketScore, review.wedgeScore, review.mvpScore, review.distributionScore, review.riskScore].map(
    (value) => scoreToNumber[value],
  );

  return Math.round(scores.reduce((acc, current) => acc + current, 0) / scores.length);
}

export function getVerdict(review: Pick<ReviewRecord, 'marketScore' | 'wedgeScore' | 'mvpScore' | 'distributionScore' | 'riskScore'>): Verdict {
  const weakCount = [review.marketScore, review.wedgeScore, review.mvpScore, review.distributionScore, review.riskScore].filter(
    (value) => value === 'weak' || value === 'unknown',
  ).length;
  const average = getOverallScore(review);

  if (review.marketScore !== 'strong' && review.marketScore !== 'medium') {
    return { label: 'Reject', tone: 'destructive', reason: 'Market proof is too weak.' };
  }
  if (review.wedgeScore !== 'strong' && review.wedgeScore !== 'medium') {
    return { label: 'Reject', tone: 'destructive', reason: 'The wedge is not yet concrete enough.' };
  }
  if (review.mvpScore === 'weak' || review.mvpScore === 'unknown') {
    return { label: 'Reject', tone: 'destructive', reason: 'The MVP still looks too large or too complex.' };
  }
  if (review.distributionScore === 'weak' || review.distributionScore === 'unknown') {
    return { label: 'Defer', tone: 'warning', reason: 'The first distribution path is underdefined.' };
  }
  if (review.riskScore === 'weak' || review.riskScore === 'unknown') {
    return { label: 'Defer', tone: 'warning', reason: 'Structural risk needs more diligence before approval.' };
  }
  if (weakCount === 0 && average >= 75) {
    return { label: 'Approve', tone: 'success', reason: 'The idea meets the core playbook gates with acceptable risk.' };
  }

  return { label: 'Defer', tone: 'warning', reason: 'Promising, but one or more gates still need stronger evidence.' };
}
