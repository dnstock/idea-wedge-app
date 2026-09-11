import { useMemo, useState } from 'react';
import { useStickyState } from '../hooks/useStickyState';
import { scoreToLabel } from '../lib/scoring';
import type { ReviewRecord, ReviewComment, ReviewStatus } from '../types';

interface SavedReviewsViewProps {
  reviews: ReviewRecord[];
  commentsByReview: Record<string, ReviewComment[]>;
  query: string;
  tagFilter: string;
  onClearTagFilter: () => void;
  statusFilter: 'all' | ReviewStatus;
  compareIds: string[];
  selectedReviews: ReviewRecord[];
  onCompare: () => void;
  onClearCompare: () => void;
  onQueryChange: (value: string) => void;
  onStatusFilterChange: (value: 'all' | ReviewStatus) => void;
  onOpen: (review: ReviewRecord) => void;
  onDelete: (reviewId: string) => Promise<void>;
  onToggleCompare: (reviewId: string) => void;
}

const statuses: Array<'all' | ReviewStatus> = ['all', 'backlog', 'researching', 'approved', 'deferred', 'rejected', 'building'];
const dateLabel = (value: string) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

export function SavedReviewsView({
  reviews, commentsByReview, query, tagFilter, onClearTagFilter, statusFilter, compareIds, selectedReviews, onCompare, onClearCompare,
  onQueryChange, onStatusFilterChange, onOpen, onDelete, onToggleCompare,
}: SavedReviewsViewProps) {
  const { sentinelRef, stickyRef } = useStickyState();
  const [view, setView] = useState<'1col' | '2col'>('1col');
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt'>('updatedAt');
  const [direction, setDirection] = useState<'newest' | 'oldest'>('newest');
  const sortedReviews = useMemo(() => [...reviews].sort((a, b) => {
    const difference = Date.parse(a[sortBy]) - Date.parse(b[sortBy]);
    return (direction === 'newest' ? -difference : difference) || a.id.localeCompare(b.id);
  }), [reviews, sortBy, direction]);

  return (
    <section className="card section-stack saved-reviews">
      <div className="section-header">
        <div>
          <h2>Idea Wedge Submissions</h2>
          <p>Explore, review, and compare submitted ideas.</p>
        </div>
      </div>
      <div ref={sentinelRef} className="sticky-sentinel" />
      <div ref={stickyRef} className="reviews-compare-tray" role="region" aria-label="Compare selected ideas">
        <div className="reviews-compare-instructions">
          <strong>Compare idea wedges</strong>
          <p role="status">{selectedReviews.length === 2 ? 'Ready to compare. Remove an idea to choose another.' : selectedReviews.length === 1 ? 'Choose one more idea to compare.' : 'Select two ideas to compare their scores, evidence, and risks.'}</p>
        </div>
        <div className="reviews-compare-slots">
          {[0, 1].map((index) => {
            const review = selectedReviews[index];
            return <div className={`reviews-compare-slot${review ? ' is-filled' : ''}`} key={index}>
              <span className="comparison-letter">{index === 0 ? 'A' : 'B'}</span>
              <span className="reviews-compare-name" title={review?.ideaName}>{review ? review.ideaName || 'Untitled idea' : `Select ${index === 0 ? 'first' : 'second'} idea`}</span>
              {review && <button type="button" className="reviews-compare-remove" aria-label={`Remove ${review.ideaName || 'Untitled idea'} from comparison`} onClick={() => onToggleCompare(review.id)}>×</button>}
            </div>;
          })}
        </div>
        <div className="reviews-compare-controls">
          <button type="button" className="button primary" disabled={selectedReviews.length !== 2} onClick={onCompare}>Compare<span className="compare-cta-extra"> ideas</span> ({selectedReviews.length}/2)</button>
          {selectedReviews.length > 0 && <button type="button" className="button ghost reviews-compare-clear" onClick={onClearCompare}>Clear selection</button>}
        </div>
      </div>
      <div className="toolbar reviews-toolbar">
        <label className="field reviews-search">
          <span>Search submissions</span>
          <input type="search" value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Ideas, owners, tags, categories" />
        </label>
        <label className="field">
          <span>Status</span>
          <select value={statusFilter} onChange={(event) => onStatusFilterChange(event.target.value as 'all' | ReviewStatus)}>
            {statuses.map((status) => <option key={status} value={status}>{status === 'all' ? 'All statuses' : status[0].toUpperCase() + status.slice(1)}</option>)}
          </select>
        </label>
        <label className="field">
          <span>View</span>
          <select value={view} onChange={(event) => setView(event.target.value as typeof view)}>
            <option value="1col">One column</option><option value="2col">Two columns</option>
          </select>
        </label>
        <label className="field">
          <span>Sort by</span>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)}>
            <option value="createdAt">Date created</option><option value="updatedAt">Date updated</option>
          </select>
        </label>
        <label className="field">
          <span>Order</span>
          <select value={direction} onChange={(event) => setDirection(event.target.value as typeof direction)}>
            <option value="newest">Newest first</option><option value="oldest">Oldest first</option>
          </select>
        </label>
      </div>
      {tagFilter && (
        <div className="reviews-active-filter" role="region" aria-label="Active tag filter">
          <div className="tag-row"><strong>Filtered by tag</strong><span className="tag">{tagFilter}</span></div>
          <button type="button" className="button ghost" onClick={onClearTagFilter} aria-label={`Clear tag filter: ${tagFilter}`}>Clear tag filter ×</button>
        </div>
      )}
      <div className="reviews-result-count" role="status">
        <span>{reviews.length} idea{reviews.length === 1 ? '' : 's'}{query || tagFilter || statusFilter !== 'all' ? ' found' : ''}</span>
        {compareIds.length > 0 && <span>{compareIds.length} selected for comparison</span>}
      </div>
      {reviews.length === 0 ? (
        <div className="empty-state">No matching reviews. Try changing or clearing your filters.</div>
      ) : (
        <div className={`reviews-list reviews-list--${view}`}>
          {sortedReviews.map((review) => {
            const selected = compareIds.includes(review.id);
            const commentCount = commentsByReview[review.id]?.length ?? 0;
            const tags = review.tags.split(',').map((tag) => tag.trim()).filter(Boolean);
            return (
              <article className={`saved-review${selected ? ' is-selected' : ''}`} key={review.id}>
                <div className="saved-review-heading">
                  <span className="saved-review-category">{review.category || 'Uncategorized'}</span>
                  <span className={`saved-review-status status-${review.status}`}>{review.status}</span>
                </div>
                <h3><button type="button" className="review-title-button" onClick={() => onOpen(review)}>{review.ideaName || 'Untitled idea'}</button></h3>
                <div className="saved-review-summary">
                  <p>{review.summary || 'No summary yet.'}</p>
                </div>
                <div className="saved-review-meta">
                  <span>{review.ownerName || 'No owner assigned'}</span>
                  <span title={review[sortBy]}>{sortBy === 'createdAt' ? 'Created' : 'Updated'} {dateLabel(review[sortBy])}</span>
                  {commentCount > 0 && <span>{commentCount} comment{commentCount === 1 ? '' : 's'}</span>}
                  {review.isDemo && <span className="iridescent-text">Demo idea</span>}
                </div>
                <div className="saved-review-verdict">
                  <strong>{review.decision ?? 'Pending'}</strong>
                  <span><strong>{review.overallScore}</strong> / 100</span>
                </div>
                <details className="saved-review-details">
                  <summary>Review details</summary>
                  <div className="saved-review-detail-content">
                    <dl className="saved-review-scores">
                      {([
                        ['Market', review.marketScore], ['Wedge', review.wedgeScore], ['MVP', review.mvpScore],
                        ['Distribution', review.distributionScore], ['Risk', review.riskScore],
                      ] as const).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{scoreToLabel[value]}</dd></div>)}
                    </dl>
                    {tags.length > 0 && <div className="tag-row" aria-label="Tags">{tags.map((tag, index) => <a key={`${tag}-${index}`} className="tag" href={`#reviews?tag=${encodeURIComponent(tag)}`}>{tag}</a>)}</div>}
                    <p className="saved-review-dates">Created {dateLabel(review.createdAt)} · Updated {dateLabel(review.updatedAt)}</p>
                  </div>
                </details>
                <div className="review-actions">
                  <button className="button primary" type="button" onClick={() => onOpen(review)}>Open review</button>
                  <label className="review-compare-checkbox">
                    <input type="checkbox" checked={selected} disabled={!selected && selectedReviews.length === 2} onChange={() => onToggleCompare(review.id)} aria-label={`Select ${review.ideaName || 'Untitled idea'} for comparison`} />
                    <span>Compare</span>
                  </label>
                  <button className="button ghost review-delete" type="button" disabled={review.isDemo} onClick={() => void onDelete(review.id)}>Delete</button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
