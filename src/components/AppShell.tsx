import type { ReactNode } from 'react';
import { APP_TITLE } from '../config';

interface AppShellProps {
  headerRight?: ReactNode;
  children: ReactNode;
}

export function AppShell({ headerRight, children }: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="app-header card">
        <div>
          <div className="eyebrow">Internal tooling</div>
          <h1>{APP_TITLE}</h1>
          <p>
            A shared system for screening business ideas against market proof, wedge clarity, MVP scope,
            distribution readiness, and structural risk.
          </p>
        </div>
        <div className="header-actions">{headerRight}</div>
      </header>
      {children}
    </div>
  );
}
