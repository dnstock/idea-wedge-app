import type { UserProfile } from '../types';

interface AuthPanelProps {
  isConfigured: boolean;
  loading: boolean;
  profile: UserProfile | null;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
}

export function AuthPanel({ isConfigured, loading, profile, onSignIn, onSignOut }: AuthPanelProps) {
  if (!isConfigured) {
    return (
      <div className="auth-card">
        <div className="badge subtle">Local demo mode</div>
        <p>No Supabase environment variables detected. Seed data is loaded locally so the app is still usable.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="auth-card">
        <div className="badge subtle">Connecting</div>
        <p>Checking your Supabase session…</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="auth-card">
        <div className="badge warning">Authentication required</div>
        <p>Sign in with Google to save reviews, add comments, and collaborate in shared mode.</p>
        <button className="button primary" onClick={() => void onSignIn()}>
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <div className="badge success">Connected</div>
      <p>
        Signed in as <strong>{profile.displayName}</strong>
        {profile.email ? <> · {profile.email}</> : null}
      </p>
      <button className="button secondary" onClick={() => void onSignOut()}>
        Sign out
      </button>
    </div>
  );
}
