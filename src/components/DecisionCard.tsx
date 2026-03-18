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
    <aside className="card sticky-card">
      <div className={`verdict-panel ${verdictClass(verdict.tone)}`}>
        <div className="badge">{verdict.label}</div>
        <h3>{verdict.reason}</h3>
        <p>Overall score: {liveOverallScore}/100</p>
      </div>

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

      <div className="rule-block">
        <h4>Operating rules</h4>
        <ul>
          <li>Start where customers already spend money.</li>
          <li>Win on a visible wedge, not novelty.</li>
          <li>Keep the first version brutally small.</li>
          <li>Name buyer, channel, and message before approval.</li>
          <li>Screen for platform and dependency risk early.</li>
        </ul>
      </div>
    </aside>
  );
}
