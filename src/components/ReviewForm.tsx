import { SCORE_OPTIONS, SECTION_DEFINITIONS, STATUS_OPTIONS } from '../config';
import type { ReviewRecord } from '../types';

interface ReviewFormProps {
  review: ReviewRecord;
  onChange: (next: ReviewRecord) => void;
  onSave: () => void;
  onReset: () => void;
  saving: boolean;
}

function updateField(review: ReviewRecord, key: keyof ReviewRecord, value: string): ReviewRecord {
  return { ...review, [key]: value };
}

export function ReviewForm({ review, onChange, onSave, onReset, saving }: ReviewFormProps) {
  return (
    <section className="card form-card">
      <div className="section-header">
        <div>
          <h2>Review workspace</h2>
          <p>Capture the idea, score the gates, and save the review for team visibility.</p>
        </div>
        <div className="inline-actions">
          <button className="button secondary" onClick={onReset} type="button">
            New review
          </button>
          <button className="button primary" onClick={onSave} type="button" disabled={saving}>
            {saving ? 'Saving…' : 'Save review'}
          </button>
        </div>
      </div>

      <div className="two-column-grid">
        <label className="field">
          <span>Idea name</span>
          <input
            value={review.ideaName}
            onChange={(event) => onChange(updateField(review, 'ideaName', event.target.value))}
            placeholder="e.g. lightweight B2B documentation platform"
          />
        </label>
        <label className="field">
          <span>Owner</span>
          <input
            value={review.ownerName}
            onChange={(event) => onChange(updateField(review, 'ownerName', event.target.value))}
            placeholder="Who owns this investigation?"
          />
        </label>
        <label className="field field-full">
          <span>One-line summary</span>
          <input
            value={review.summary}
            onChange={(event) => onChange(updateField(review, 'summary', event.target.value))}
            placeholder="What does it do and for whom?"
          />
        </label>
        <label className="field">
          <span>Status</span>
          <select value={review.status} onChange={(event) => onChange(updateField(review, 'status', event.target.value))}>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Tags</span>
          <input
            value={review.tags}
            onChange={(event) => onChange(updateField(review, 'tags', event.target.value))}
            placeholder="comma-separated tags"
          />
        </label>
      </div>

      <div className="accordion-group">
        {SECTION_DEFINITIONS.map((section) => (
          <details key={section.key} open className="accordion-item">
            <summary>
              <div>
                <strong>{section.title}</strong>
                <p>{section.description}</p>
              </div>
            </summary>
            <div className="accordion-content">
              {section.fields.map((field) => (
                <label className="field" key={field.key}>
                  <span>{field.label}</span>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={String(review[field.key as keyof ReviewRecord] ?? '')}
                      onChange={(event) => onChange(updateField(review, field.key as keyof ReviewRecord, event.target.value))}
                      placeholder={field.placeholder}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      value={String(review[field.key as keyof ReviewRecord] ?? 'unknown')}
                      onChange={(event) => onChange(updateField(review, field.key as keyof ReviewRecord, event.target.value))}
                    >
                      {SCORE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      value={String(review[field.key as keyof ReviewRecord] ?? '')}
                      onChange={(event) => onChange(updateField(review, field.key as keyof ReviewRecord, event.target.value))}
                      placeholder={field.placeholder}
                    />
                  )}
                </label>
              ))}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
