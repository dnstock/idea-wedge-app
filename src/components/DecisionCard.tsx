import { OperatingRules } from './OperatingRules';
import { getOverallScore, scoreToLabel } from '../lib/scoring';
import type { ReviewRecord, Verdict } from '../types';

interface DecisionCardProps {
  review: ReviewRecord;
  verdict: Verdict;
}

function verdictClass(tone: Verdict['tone']) {
  if (tone === 'success') return 'success-surface';
  if (tone === 'warning') return 'warning-surface';
  return 'danger-surface';
}

export function DecisionCard({ review, verdict }: DecisionCardProps) {
  const liveOverallScore = getOverallScore(review);

  return (
    <>
    <aside className="sticky-card">
      <div className={`verdict-panel ${verdictClass(verdict.tone)}`}>
        <div className="badge">{verdict.label}</div>
        <h3>{verdict.reason}</h3>
        <p>Overall score: {liveOverallScore}/100</p>
      </div>
    </aside>
    <section className="card decision-card">
      <div className="score-list">
        {[
          ['Market', review.marketScore],
          ['Wedge', review.wedgeScore],
          ['MVP', review.mvpScore],
          ['Distribution', review.distributionScore],
          ['Risk', review.riskScore],
        ].map(([label, value]) => (
          <div key={label} className="score-row">
            <span>{label}</span>
            <strong>{scoreToLabel[value as ReviewRecord['marketScore']]}</strong>
          </div>
        ))}
      </div>

      <OperatingRules key={review.id} />
    </section>
    </>
  );
}
