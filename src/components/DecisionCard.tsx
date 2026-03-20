import { usePersistentBoolean } from '../hooks/usePersistentBoolean';
import { getOverallScore, scoreToLabel } from '../lib/scoring';
import type { ReviewRecord, Verdict } from '../types';

interface DecisionCardProps {
  review: ReviewRecord;
  verdict: Verdict;
  defaultOpen?: boolean;
}

function verdictClass(tone: Verdict['tone']) {
  if (tone === 'success') return 'success-surface';
  if (tone === 'warning') return 'warning-surface';
  return 'danger-surface';
}

export function DecisionCard({ review, verdict, defaultOpen = true }: DecisionCardProps) {
  const liveOverallScore = getOverallScore(review);
  const [isRulesOpen, setIsRulesOpen] = usePersistentBoolean(
    'rule-block:operating-rules',
    defaultOpen
  );

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

      <div className="rule-block">
        <details
          open={isRulesOpen}
          onToggle={(e) => setIsRulesOpen(e.currentTarget.open)}
        >
          <summary>
            <h4>Operating rules</h4>
          </summary>
          <ul>
            <li>Start where customers already spend money.</li>
            <li>Win on a visible wedge, not novelty.</li>
            <li>Keep the first version brutally small.</li>
            <li>Name buyer, channel, &amp; message before approval.</li>
            <li>Screen for platform and dependency risk early.</li>
          </ul>
        </details>
      </div>
    </section>
    </>
  );
}
