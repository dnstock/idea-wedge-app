import type { ReviewComment } from '../types';
import { useState } from 'react';

interface CommentsPanelProps {
  canComment: boolean;
  comments: ReviewComment[];
  onAddComment: (body: string) => Promise<void>;
}

export function CommentsPanel({ canComment, comments, onAddComment }: CommentsPanelProps) {
  const [draft, setDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    const body = draft.trim();
    if (!body || !canComment) return;
    setSubmitting(true);
    try {
      await onAddComment(body);
      setDraft('');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="card comments-card">
      <div className="section-header compact">
        <div>
          <h2>Team comments</h2>
          <p>Capture objections, next-step suggestions, or stress tests against the current review.</p>
        </div>
      </div>

      {!canComment ? (
        <div className="empty-state">Save the review first, then comments can be attached to it.</div>
      ) : (
        <>
          <div className="comment-form">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Add a comment, objection, or next-step recommendation"
            />
            <button className="button primary" type="button" onClick={() => void submit()} disabled={submitting}>
              {submitting ? 'Posting…' : 'Add comment'}
            </button>
          </div>

          <div className="comment-list">
            {comments.length === 0 ? (
              <div className="empty-state">No comments yet.</div>
            ) : (
              comments.map((comment) => (
                <article key={comment.id} className="comment-card">
                  <div className="comment-meta">
                    <strong>{comment.authorName}</strong>
                    <span>{new Date(comment.createdAt).toLocaleString()}</span>
                  </div>
                  <p>{comment.body}</p>
                </article>
              ))
            )}
          </div>
        </>
      )}
    </section>
  );
}
