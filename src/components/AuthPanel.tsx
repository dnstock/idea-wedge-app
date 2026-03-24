import type { UserProfile } from '../types';

interface AuthPanelProps {
  profile: UserProfile;
  onSignOut: () => Promise<void>;
}

export function AuthPanel({ profile, onSignOut }: AuthPanelProps) {
  return (
    <div className="account-menu">
      <div className="account-menu-avatar">
        {profile.avatarUrl ? (
          <img src={profile.avatarUrl} alt={`${profile.displayName}'s avatar`} />
        ) : (
          <div className="account-menu-avatar-placeholder">
            {profile.displayName.split(' ').map((part) => part[0]).join('').toUpperCase()}
          </div>
        )}
      </div>
      <div className="account-menu-details">
        <div className="account-menu-name-row">
          <span className="account-menu-name">{profile.displayName}</span>
          {/* <span className="account-menu-badge">Connected</span> */}
        </div>
        <div className="account-menu-email">{profile.email ? profile.email : null}</div>
      </div>
      <div className="account-menu-actions">
        {/* <button className="button white">Profile</button>
        <button className="button white">Settings</button> */}
        <button className="button white" onClick={() => void onSignOut()}>
          Sign out
        </button>
      </div>
    </div>
  );
}
