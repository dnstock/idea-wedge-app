import { useState } from 'react';

const dos = [
  'Start where customers already spend money',
  'Win on a visible wedge, not novelty',
  'Keep the first version brutally small',
  'Name buyer, channel, & message before approval',
  'Screen for platform and dependency risk early',
];

const donts = [
  'Pursue ideas just because they are exciting',
  'Overvalue originality',
  'Approve ideas without a named wedge',
  'Let MVP scope drift',
  'Assume distribution will emerge later',
  'Ignore platform or dependency risk',
  'Confuse positive anecdotes with validated demand',
];

export function OperatingRules({ className = '' }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(true);

  const [isDosOpen, setIsDosOpen] = useState(true);
  const [isDontsOpen, setIsDontsOpen] = useState(true);

  return <section className={`rule-block ${className}`} aria-label="Operating Rules">
    <details open={isOpen} onToggle={(event) => {
      if (event.target === event.currentTarget) setIsOpen(event.currentTarget.open);
    }}>
      <summary><h4>Operating Rules</h4></summary>
      <details className="operating-rules-group" open={isDosOpen} onToggle={(event) => setIsDosOpen(event.currentTarget.open)}>
        <summary><h5>Do</h5></summary>
        <ul>{dos.map(rule => <li key={rule}>{rule}</li>)}</ul>
      </details>
      <details className="operating-rules-group" open={isDontsOpen} onToggle={(event) => setIsDontsOpen(event.currentTarget.open)}>
        <summary><h5>Don't</h5></summary>
        <ul>{donts.map(rule => <li key={rule}>{rule}</li>)}</ul>
      </details>
    </details>
  </section>;
}
