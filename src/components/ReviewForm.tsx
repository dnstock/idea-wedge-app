import { useStickyState } from '../hooks/useStickyState';
import { SCORE_OPTIONS, SECTION_DEFINITIONS, STATUS_OPTIONS } from '../config';
import type { ReviewRecord, UserProfile } from '../types';

interface ReviewFormProps {
  profile: UserProfile;
  review: ReviewRecord;
  onChange: (next: ReviewRecord) => void;
  onSave: () => void;
  saving: boolean;
  isNewIdea: boolean;
}

function updateField(review: ReviewRecord, key: keyof ReviewRecord, value: string): ReviewRecord {
  return { ...review, [key]: value };
}

export function ReviewForm({ profile, review, onChange, onSave, saving, isNewIdea }: ReviewFormProps) {
  const { sentinelRef, stickyRef } = useStickyState();

  const headerContent = isNewIdea
  ? {
      title: 'New Idea',
      subtitle: 'Capture the idea, score the gates, and save the review for team visibility.',
      buttonLabel: 'Submit idea',
      buttonLabelSaving: 'Submitting…',
    }
  : {
      title: review.ideaName || 'Untitled idea',
      subtitle: 'Revise the idea details, adjust the scores, and save your changes.',
      buttonLabel: 'Update idea',
      buttonLabelSaving: 'Updating…',
    };

  const submittedDisplay = isNewIdea ? null : <span className="badge subtle unsticky" title={review.createdAt.toString()}>Submitted: {new Date(review.createdAt).toLocaleDateString()}</span>;
  const updatedDisplay = isNewIdea || review.updatedAt === review.createdAt ? null : <span className="badge subtle unsticky" title={review.updatedAt.toString()}>Updated: {new Date(review.updatedAt).toLocaleDateString()}</span>;
  const demoDisplay = review.isDemo ? <span className="badge demo unsticky">Demo Idea</span> : null;

  if (isNewIdea && !review.ownerName) {
    review = { ...review, ownerName: profile.displayName };
  }

  return (
    <section className="card form-card">
      <div ref={sentinelRef} className="sticky-sentinel" />
      <div ref={stickyRef} className="section-header sticky-header">
        <div>
          <h2><span className="iridescent-text">{headerContent.title}</span></h2>
          {submittedDisplay} {updatedDisplay} {demoDisplay}
          <p className="unsticky">{headerContent.subtitle}</p>
        </div>
        <div className="inline-actions">
          <button className="button primary nobreak" onClick={onSave} type="button" disabled={review.isDemo || saving}>
            {saving ? headerContent.buttonLabelSaving : headerContent.buttonLabel}
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
