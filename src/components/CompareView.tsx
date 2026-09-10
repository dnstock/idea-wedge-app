import { SECTION_DEFINITIONS } from '../config';
import { getOverallScore, getVerdict, scoreToLabel } from '../lib/scoring';
import type { ReviewRecord } from '../types';

interface CompareViewProps {
  reviews: ReviewRecord[];
  onOpen: (review: ReviewRecord) => void;
  onChooseReviews: () => void;
}

const gates = [
  ['Market', 'marketScore'], ['Wedge', 'wedgeScore'], ['MVP', 'mvpScore'],
  ['Distribution', 'distributionScore'], ['Risk', 'riskScore'],
] as const;
const keyFactors = [
  ['The wedge', 'improvement'], ['First buyer', 'buyer'], ['First channel', 'channel'],
  ['Smallest sellable version', 'core'], ['Structural kill shot', 'killShot'], ['Out of scope', 'outOfScope'],
] as const;

function ComparisonHeading({ reviews }: { reviews: ReviewRecord[] }) {
  return <thead><tr><th scope="col">Decision factor</th>{reviews.map((review, index) => (
    <th scope="col" key={review.id}><span className="comparison-letter">{index === 0 ? 'A' : 'B'}</span> {review.ideaName || 'Untitled idea'}</th>
  ))}</tr></thead>;
}

export function CompareView({ reviews, onOpen, onChooseReviews }: CompareViewProps) {
  if (reviews.length < 2) {
    return (
      <section className="card section-stack comparison-view">
        <div className="section-header"><div><h2>Compare ideas</h2><p>Evaluate two ideas against the same playbook gates.</p></div></div>
        <div className="empty-state">
          <h3>{reviews.length === 1 ? 'Choose one more idea' : 'Choose two ideas to compare'}</h3>
          <p>{reviews.length === 1 ? `${reviews[0].ideaName || 'Untitled idea'} is selected. Choose another review to see them side by side.` : 'Use Compare on two saved reviews to examine their scores, evidence, and risks together.'}</p>
          <button type="button" className="button primary" onClick={onChooseReviews}>Choose reviews</button>
        </div>
      </section>
    );
  }

  const candidates = reviews.slice(0, 2);
  const differenceCount = gates.filter(([, key]) => candidates[0][key] !== candidates[1][key]).length;

  return (
    <section className="card section-stack comparison-view">
      <div className="section-header">
        <div><h2>Compare ideas</h2><p>Compare the scores, then examine the evidence behind each idea.</p></div>
        <button type="button" className="button secondary" onClick={onChooseReviews}>Change ideas</button>
      </div>

      <div className="comparison-overview">
        {candidates.map((review, index) => (
          <article className="comparison-candidate" key={review.id}>
            <div className="comparison-candidate-top"><span className="comparison-letter">{index === 0 ? 'A' : 'B'}</span><span className={`saved-review-status status-${review.status}`}>{review.status}</span></div>
            <p className="comparison-category">{review.category || 'Uncategorized'}</p>
            <h3><button className="review-title-button" type="button" onClick={() => onOpen(review)}>{review.ideaName || 'Untitled idea'}</button></h3>
            <p className="comparison-description">{review.summary || 'No summary provided.'}</p>
            <div className="comparison-candidate-footer"><span>{review.ownerName || 'No owner assigned'}{review.isDemo ? ' · Demo idea' : ''}</span><button className="button secondary" type="button" onClick={() => onOpen(review)}>Open review</button></div>
          </article>
        ))}
      </div>

      <div className="comparison-section-heading"><h3>Decision at a glance</h3><p>{differenceCount === 0 ? 'Both ideas have the same gate ratings.' : `${differenceCount} of 5 gate ratings differ.`} Strong means higher confidence, including for risk.</p></div>
      <p className="comparison-scroll-hint">Scroll sideways to compare both ideas.</p>
      <div className="comparison-table-scroll" tabIndex={0} role="region" aria-label="Decision scores and key factors">
        <table className="comparison-table">
          <caption className="comparison-sr-only">Decision scores and key factors for the two selected ideas</caption>
          <ComparisonHeading reviews={candidates} />
          <tbody>
            <tr className="comparison-decision"><th scope="row">Saved decision</th>{candidates.map((review) => <td key={review.id}><span className={`comparison-verdict verdict-${(review.decision || 'Pending').toLowerCase()}`}>{review.decision ?? 'Pending'}</span></td>)}</tr>
            <tr><th scope="row">Overall score</th>{candidates.map((review) => <td key={review.id}><strong className="comparison-total">{getOverallScore(review)}</strong><span className="comparison-out-of"> / 100</span></td>)}</tr>
            <tr><th scope="row">Playbook assessment<small>Based on current gate ratings</small></th>{candidates.map((review) => {
              const verdict = getVerdict(review);
              return <td key={review.id}><strong>{verdict.label}</strong><p className="comparison-assessment">{verdict.reason}</p></td>;
            })}</tr>
            {gates.map(([label, key]) => {
              const differs = candidates[0][key] !== candidates[1][key];
              return <tr key={key} className={differs ? 'comparison-difference' : undefined}><th scope="row">{label}{differs && <small>Different ratings</small>}</th>{candidates.map((review) => <td key={review.id}><span className={`comparison-rating rating-${review[key]}`}>{scoreToLabel[review[key]]}</span></td>)}</tr>;
            })}
          </tbody>
          <tbody>
            <tr className="comparison-divider"><th colSpan={3}>Key context &amp; tradeoffs</th></tr>
            {keyFactors.map(([label, key]) => <tr key={key}><th scope="row">{label}</th>{candidates.map((review) => <td key={review.id} className={review[key].trim() ? '' : 'comparison-missing'}>{review[key].trim() || 'Not provided'}</td>)}</tr>)}
          </tbody>
        </table>
      </div>

      <div className="comparison-section-heading"><h3>Supporting evidence</h3><p>Expand a gate to compare the research, assumptions, and constraints behind its rating.</p></div>
      <div className="comparison-evidence">
        {SECTION_DEFINITIONS.map((section) => {
          const fields = section.fields.filter((field) => field.type !== 'select' && field.key !== 'category' && !keyFactors.some(([, key]) => key === field.key));
          return <details key={section.key} className="comparison-evidence-section">
            <summary>{section.title.replace(/^\d+\. /, '')}<span>View evidence</span></summary>
            <div className="comparison-table-scroll" tabIndex={0} role="region" aria-label={`${section.title} evidence`}>
              <table className="comparison-table"><caption className="comparison-sr-only">{section.title} supporting evidence</caption><ComparisonHeading reviews={candidates} /><tbody>
                {fields.map((field) => <tr key={field.key}><th scope="row">{field.label}</th>{candidates.map((review) => <td key={review.id} className={String(review[field.key]).trim() ? '' : 'comparison-missing'}>{String(review[field.key]).trim() || 'Not provided'}</td>)}</tr>)}
              </tbody></table>
            </div>
          </details>;
        })}
      </div>
    </section>
  );
}
