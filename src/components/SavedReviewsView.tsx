import { scoreToLabel } from '../lib/scoring';
import type { ReviewRecord, ReviewComment, ReviewStatus } from '../types';

interface SavedReviewsViewProps {
  reviews: ReviewRecord[];
  commentsByReview: Record<string, ReviewComment[]>;
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
  commentsByReview,
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

  const commentCountBadge = (reviewId: string) => {
    const commentCount = commentsByReview[reviewId]?.length;
    return commentCount ? <span className="badge success outlined">{commentCount} comment{commentCount===1?'':'s'}</span> : null;
  }

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
                  <span className="review-category">{review.category}</span>
                  <h3><span className="iridescent-text">{review.ideaName || 'Untitled idea'}</span></h3>
                  <p>{review.summary || 'No summary yet.'}</p>
                  <div className="tag-row">
                    <span className="label">Tags:</span>
                    {review.tags
                      ? review.tags.split(',').map((tag) => (
                          <span key={tag} className="tag">
                            {tag.trim()}
                          </span>
                        ))
                      : <span className="no-tags">--</span>
                    }
                  </div>
                </div>
                <span className="review-status">{review.status}</span>
              </div>

              <div className="badge-row">
                <span className="badge">{review.decision ?? 'Pending'}<span className="split">{review.overallScore}/100</span></span>
                {commentCountBadge(review.id)}
                {review.ownerName ? <span className="badge subtle">Owner: {review.ownerName}</span> : null}
                <span title={review.createdAt.toString()} className="badge subtle">Submitted: {new Date(review.createdAt).toLocaleDateString()}</span>
                {review.updatedAt !== review.createdAt ? (
                  <span title={review.updatedAt.toString()} className="badge subtle">Updated: {new Date(review.updatedAt).toLocaleDateString()}</span>
                ) : null}
                {review.isDemo ? <span className="badge demo">Demo Idea</span> : null}
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
                <button className="button secondary" type="button" disabled={review.isDemo} onClick={() => void onDelete(review.id)}>
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
