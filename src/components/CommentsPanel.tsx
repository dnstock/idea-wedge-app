import type { ReviewComment } from '../types';
import { useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function CommentMarkdown({ body }: { body: string }) {
  return <div className="comment-body"><Markdown remarkPlugins={[remarkGfm]} skipHtml>{body}</Markdown></div>;
}

interface CommentsPanelProps {
  canComment: boolean;
  comments: ReviewComment[];
  onAddComment: (body: string) => Promise<void>;
}

export function CommentsPanel({ canComment, comments, onAddComment }: CommentsPanelProps) {
  const [draft, setDraft] = useState('');
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    const body = draft.trim();
    if (!body || !canComment || submitting) return;
    setError('');
    setSubmitting(true);
    try {
      await onAddComment(body);
      setDraft('');
      setPreview(false);
    } catch {
      setError('Your comment could not be posted. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="card comments-card">
      <div className="section-header compact">
        <div>
          <h2 id="comments-heading" tabIndex={-1}>Team Comments ({comments.length})</h2>
          <p>Capture objections, next-step suggestions, or stress tests against the current review.</p>
        </div>
      </div>

      {!canComment ? (
        <div className="empty-state">Save the review first, then comments can be attached to it.</div>
      ) : (
        <>
          <div className="comment-form">
            <label htmlFor="comment-draft">Leave a comment</label>
            <textarea
              id="comment-draft"
              aria-describedby="comment-format-help"
              disabled={submitting}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Add a comment, objection, or next-step recommendation"
            />
            <p id="comment-format-help" className="comment-format-help">Markdown supported: **bold**, *italic*, [links](https://example.com), lists, quotes, and code.</p>
            <button className="button ghost" type="button" aria-expanded={preview} aria-controls="comment-preview" onClick={() => setPreview(!preview)} disabled={!draft.trim()}>
              {preview ? 'Hide preview' : 'Preview formatting'}
            </button>
            {preview && <div id="comment-preview" className="comment-preview"><span className="comment-format-help">Preview</span><CommentMarkdown body={draft} /></div>}
            {error && <p role="alert">{error}</p>}
            <button className="button primary" type="button" onClick={() => void submit()} disabled={submitting || !draft.trim()}>
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
                  <CommentMarkdown body={comment.body} />
                </article>
              ))
            )}
          </div>
        </>
      )}
    </section>
  );
}
