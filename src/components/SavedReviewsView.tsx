import { scoreToLabel } from '../lib/scoring';
import type { ReviewRecord, ReviewStatus } from '../types';

interface SavedReviewsViewProps {
  reviews: ReviewRecord[];
  query: string;
  statusFilter: 'all' | ReviewStatus;
  compareIds: string[];
  loading: boolean;
  onQueryChange: (value: string) => void;
  onStatusFilterChange: (value: 'all' | ReviewStatus) => void;
  onOpen: (review: ReviewRecord) => void;
  onDelete: (reviewId: string) => Promise<void>;
  onToggleCompare: (reviewId: string) => void;
}

const statuses: Array<'all' | ReviewStatus> = ['all', 'backlog', 'researching', 'approved', 'deferred', 'rejected', 'building'];

export function SavedReviewsView({
  reviews,
  query,
  statusFilter,
  compareIds,
  loading,
  onQueryChange,
  onStatusFilterChange,
  onOpen,
  onDelete,
  onToggleCompare,
}: SavedReviewsViewProps) {
  return (
    <section className="card section-stack">
      <div className="section-header">
        <div>
          <h2>Saved reviews</h2>
          <p>Search and filter prior reviews, re-open them in the workspace, or send two to compare.</p>
        </div>
      </div>

      <div className="toolbar">
        <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search ideas, owners, tags, categories" />
        <select value={statusFilter} onChange={(event) => onStatusFilterChange(event.target.value as 'all' | ReviewStatus)}>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="empty-state">Loading reviews…</div>
      ) : reviews.length === 0 ? (
        <div className="empty-state">No matching reviews.</div>
      ) : (
        <div className="review-grid">
          {reviews.map((review) => (
            <article className="review-card" key={review.id}>
              <div className="review-card-top">
                <div>
                  <h3>{review.ideaName || 'Untitled idea'}</h3>
                  <p>{review.summary || 'No summary yet.'}</p>
                </div>
                <span className="badge subtle">{review.status}</span>
              </div>

              <div className="badge-row">
                <span className="badge">{review.decision ?? 'Pending'}</span>
                <span className="badge subtle">{review.overallScore}/100</span>
                {review.ownerName ? <span className="badge subtle">Owner: {review.ownerName}</span> : null}
              </div>

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

              <div className="review-actions">
                <button className="button primary" type="button" onClick={() => onOpen(review)}>
                  Open
                </button>
                <button className="button secondary" type="button" onClick={() => void onDelete(review.id)}>
                  Delete
                </button>
                <button
                  className={`button ${compareIds.includes(review.id) ? 'primary' : 'secondary'}`}
                  type="button"
                  onClick={() => onToggleCompare(review.id)}
                >
                  {compareIds.includes(review.id) ? 'Selected' : 'Compare'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
