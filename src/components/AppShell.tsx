import type { ReactNode } from 'react';
import { APP_TITLE } from '../config';

interface AppShellProps {
  headerRight?: ReactNode;
  children: ReactNode;
  onReset: () => void;
}

export function AppShell({ headerRight, children, onReset }: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="card app-header">
        <div className="app-header-brand">
          {/* <div className="app-header-meta">
            <span className="app-header-eyebrow">Internal Tool</span>
            <span className="app-header-dot" />
            <span className="app-header-meta-item">Review &amp; Validate Business Ideas</span>
          </div> */}
          <img className="app-header-logo" src="/light-bulb-idea.png" />
          {/* <img className="app-header-logo" src="/idea-playbook.png" /> */}
          <h1 className="app-header-title">{APP_TITLE}</h1>
          <div className="app-header-description">
            An internal tool for reviewing and validating business ideas.
          </div>
        </div>
        <div className="app-header-controls">
          <button className="button ghost" id="new-idea-button" onClick={onReset}>
            <span className="iridescent-text new-idea">New Idea</span>
          </button>
          <div className="header-actions">{headerRight}</div>
        </div>
        <button className="button iridescent-button new-idea" id="new-idea-button-mobile" type="button" onClick={onReset}>
          New Idea
        </button>
      </header>
      {children}
    </div>
  );
}
