import { APP_TITLE } from '../config';

type Props = {
  isConfigured: boolean;
  loading: boolean;
  onSignIn: () => void | Promise<void>;
};

export function LoginScreen({ isConfigured, loading, onSignIn }: Props) {
  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="logo">
          <img src="/light-bulb-idea.png" />
        </div>
        <div className="eyebrow warning">Authentication required</div>
        <h1><span className="iridescent-text">{APP_TITLE}</span></h1>

        {isConfigured ? (
          <div className="info-banner">
            Sign in to access saved reviews, team comments, comparisons, and the rest of the app.
          </div>
        ) : (
          <div className="error-banner" style={{ marginTop: '16px' }}>
            Google auth is not configured yet. Complete setup before signing in.
          </div>
        )}

        <div className="login-actions">
          <button
            type="button"
            className="button primary"
            onClick={() => void onSignIn()}
            disabled={!isConfigured || loading}
          >
            {loading ? 'Signing in…' : 'Continue with Google'}
          </button>
        </div>
      </div>
    </div>
  );
}
