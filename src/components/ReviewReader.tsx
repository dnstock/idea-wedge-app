import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { SECTION_DEFINITIONS } from '../config';
import { getOverallScore, getVerdict, scoreToLabel } from '../lib/scoring';
import type { ReviewRecord, ScoreValue } from '../types';

interface Props {
  review: ReviewRecord;
  presenting: boolean;
  onEdit: () => void;
  onPresent: (value: boolean) => void;
  onBack: () => void;
}

export function ReviewReader({ review, presenting, onEdit, onPresent, onBack }: Props) {
  const readerRef = useRef<HTMLDivElement>(null);
  const [shareMessage, setShareMessage] = useState('');
  const verdict = getVerdict(review);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') onPresent(false); };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [onPresent]);

  useEffect(() => { window.scrollTo(0, 0); }, [presenting, review.id]);

  // Wrapped headings and the presentation toolbar determine the sticky offsets.
  useLayoutEffect(() => {
    const reader = readerRef.current;
    if (!reader) return;
    const toolbar = reader.querySelector<HTMLElement>('.reader-toolbar');
    const headings = reader.querySelectorAll<HTMLElement>('.reader-section-heading');
    const measure = () => {
      reader.style.setProperty('--reader-sticky-top', `${presenting && toolbar ? toolbar.getBoundingClientRect().height : 0}px`);
      headings.forEach(heading => heading.parentElement?.style.setProperty('--reader-heading-height', `${heading.getBoundingClientRect().height}px`));
    };
    const observer = new ResizeObserver(measure);
    if (toolbar) observer.observe(toolbar);
    headings.forEach(heading => observer.observe(heading));
    measure();
    return () => observer.disconnect();
  }, [presenting, review.id]);

  function jumpTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }

  async function copyLink() {
    const url = new URL(window.location.href);
    url.hash = `workspace/${review.id}`;
    try {
      await navigator.clipboard.writeText(url.toString());
      setShareMessage('Link copied. Recipients must sign in and have access to this review.');
    } catch {
      setShareMessage('Copy the reading link below. Recipients must sign in and have access.');
    }
  }

  return <div ref={readerRef} className={`review-reader${presenting ? ' is-presenting' : ''}`}>
    <div className="reader-toolbar">
      <button className="button ghost" onClick={presenting ? () => onPresent(false) : onBack}>{presenting ? '← Exit presentation' : '← Saved reviews'}</button>
      <div className="inline-actions">
        {!presenting && <>
          <button className="button ghost" onClick={() => void copyLink()}>Copy link</button>
          <button className="button ghost" onClick={() => window.print()}>Print / PDF</button>
          <button className="button ghost" onClick={() => onPresent(true)}>Present</button>
          {!review.isDemo && <button className="button primary" onClick={onEdit}>Edit idea</button>}
        </>}
        {presenting && <span className="reader-hint">Press Esc to exit</span>}
      </div>
    </div>
    {shareMessage && !presenting && <div className="reader-share" role="status">{shareMessage}<input aria-label="Reading link" readOnly value={`${window.location.href.split('#')[0]}#workspace/${review.id}`} onFocus={(event) => event.target.select()} /></div>}
    <div className="reader-layout">
      <aside className="reader-sidebar">
      <nav className="reader-nav" aria-label="Review sections">
        <span>IN THIS REVIEW</span>
        <button onClick={() => jumpTo('reader-overview')}>Overview</button>
        {SECTION_DEFINITIONS.map((section) => <button key={section.key} onClick={() => jumpTo(`reader-${section.key}`)}>{section.title}</button>)}
      </nav>
      <section className="reader-score-summary" aria-label="Review score summary">
        <div className="reader-score-total"><span>Overall score</span><strong>{getOverallScore(review)}<small> / 100</small></strong></div>
        <span className={`reader-confidence reader-confidence--${verdict.tone === 'success' ? 'strong' : verdict.tone === 'warning' ? 'medium' : 'weak'}`}>{verdict.label}</span>
        <dl>{SECTION_DEFINITIONS.map(section => {
          const score = section.fields.find(field => field.type === 'select');
          if (!score) return null;
          const value = review[score.key] as ScoreValue;
          return <div key={section.key}><dt>{({ market: 'Market', wedge: 'Wedge', mvp: 'MVP', distribution: 'Distribution', risk: 'Risk' } as Record<string, string>)[section.key]}</dt><dd className={`reader-confidence reader-confidence--${value}`}>{scoreToLabel[value]}</dd></div>;
        })}</dl>
      </section>
      </aside>
      <article className="reader-document">
        <header id="reader-overview" className="reader-overview">
          <div className="reader-eyebrow">Idea brief <span> / {review.status}</span>{review.isDemo && <span> / Demo</span>}</div>
          <h2 className="iridescent-text">{review.ideaName || 'Untitled idea'}</h2>
          <p className="reader-summary">{review.summary || 'No summary added yet.'}</p>
          <div className="reader-meta"><span>{review.ownerName || 'No owner assigned'}</span><span>Created <time dateTime={review.createdAt}>{new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</time></span><span>Updated {new Date(review.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span></div>
          {review.tags && <div className="tag-row reader-tags" aria-label="Tags">{[...new Set(review.tags.split(',').map(t => t.trim()).filter(Boolean))].map(tag => <a className="tag" href={`#reviews?tag=${encodeURIComponent(tag)}`} key={tag}>{tag}</a>)}</div>}
          <div className={`reader-verdict reader-verdict--${verdict.tone}`}><div><span>Playbook recommendation</span><strong>{verdict.label}</strong><p>{verdict.reason}</p></div><div className="reader-total"><strong>{getOverallScore(review)}<small> / 100</small></strong><span>Overall score</span></div></div>
        </header>
        {SECTION_DEFINITIONS.map((section) => {
          const score = section.fields.find(field => field.type === 'select');
          return <section className="reader-section" id={`reader-${section.key}`} key={section.key}>
            <div className="reader-section-heading"><h3>{section.title}</h3>{score && <span className={`reader-confidence reader-confidence--${review[score.key]}`}>{scoreToLabel[review[score.key] as ScoreValue]} confidence</span>}</div>
            <p className="reader-section-description">{section.description}</p>
            <dl>{section.fields.filter(field => field.type !== 'select').map(field => <div key={field.key}><dt>{field.label}</dt><dd className={!review[field.key] ? 'reader-empty' : undefined}>{String(review[field.key] || 'Not yet documented.')}</dd></div>)}</dl>
          </section>;
        })}
      </article>
    </div>
  </div>;
}
