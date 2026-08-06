import { Suspense, lazy, useId, useState } from 'react';

const MarkdownPreview = lazy(() => import('./MarkdownPreview'));

interface MarkdownFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

type Mode = 'write' | 'preview';

export function MarkdownField({ value, onChange, placeholder }: MarkdownFieldProps) {
  const [mode, setMode] = useState<Mode>('write');
  const panelId = useId();
  const hasContent = value.trim().length > 0;

  return (
    <div className="markdown-field">
      <div className="markdown-toolbar" role="tablist" aria-label="Markdown editor mode">
        <button
          type="button"
          role="tab"
          id={`${panelId}-write-tab`}
          aria-selected={mode === 'write'}
          aria-controls={panelId}
          className={`button ghost markdown-tab${mode === 'write' ? ' is-active' : ''}`}
          onClick={() => setMode('write')}
        >
          Write
        </button>
        <button
          type="button"
          role="tab"
          id={`${panelId}-preview-tab`}
          aria-selected={mode === 'preview'}
          aria-controls={panelId}
          className={`button ghost markdown-tab${mode === 'preview' ? ' is-active' : ''}`}
          onClick={() => setMode('preview')}
        >
          Preview
        </button>
      </div>

      {mode === 'write' ? (
        <textarea
          id={panelId}
          role="tabpanel"
          aria-labelledby={`${panelId}-write-tab`}
          className="markdown-input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <div
          id={panelId}
          role="tabpanel"
          aria-labelledby={`${panelId}-preview-tab`}
          className="markdown-preview"
        >
          {hasContent ? (
            <Suspense fallback={<p className="markdown-empty">Loading preview…</p>}>
              <MarkdownPreview value={value} />
            </Suspense>
          ) : (
            <p className="markdown-empty">Nothing to preview yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
