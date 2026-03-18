import { scoreToLabel } from '../lib/scoring';
import type { ReviewRecord } from '../types';

interface CompareViewProps {
  reviews: ReviewRecord[];
}

function CompareBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="compare-block">
      <span>{label}</span>
      <div>{value || '—'}</div>
    </div>
  );
}

export function CompareView({ reviews }: CompareViewProps) {
  if (reviews.length < 2) {
    return (
      <section className="card section-stack">
        <div className="section-header">
          <div>
            <h2>Compare ideas</h2>
            <p>Select two ideas from Saved Reviews to compare them side-by-side.</p>
          </div>
        </div>
        <div className="empty-state">Pick two reviews to compare.</div>
      </section>
    );
  }

  return (
    <section className="card section-stack">
      <div className="section-header">
        <div>
          <h2>Compare ideas</h2>
          <p>Stress-test two candidates against the same evaluation surface.</p>
        </div>
      </div>

      <div className="compare-grid">
        {reviews.map((review) => (
          <article className="compare-card" key={review.id}>
            <div className="compare-header">
              <h3>{review.ideaName}</h3>
              <span className="badge">{review.decision ?? 'Pending'}</span>
            </div>
            <p className="compare-summary">{review.summary}</p>
            <CompareBlock label="Owner" value={review.ownerName} />
            <CompareBlock label="Status" value={review.status} />
            <CompareBlock label="Wedge" value={review.improvement} />
            <CompareBlock label="First buyer" value={review.buyer} />
            <CompareBlock label="First channel" value={review.channel} />
            <CompareBlock label="Structural kill shot" value={review.killShot} />
            <CompareBlock label="Out of scope" value={review.outOfScope} />
            <div className="score-mini-grid">
              {[
                ['Market', review.marketScore],
                ['Wedge', review.wedgeScore],
                ['MVP', review.mvpScore],
                ['Distribution', review.distributionScore],
                ['Risk', review.riskScore],
              ].map(([label, value]) => (
                <div key={label} className="score-mini-cell">
                  <span>{label}</span>
                  <strong>{scoreToLabel[value as ReviewRecord['marketScore']]}</strong>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
