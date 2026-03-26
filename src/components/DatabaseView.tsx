import { useState, type MouseEvent } from 'react';
import slugify from 'typescript-slugify';

interface CopyButtonProps {
  value: string;
  label: string;
  copiedKey: string | null;
  onCopy: (value: string, key: string) => void;
};

interface DatabaseClientCardProps {
  href: string;
  badge?: string;
  title: string;
  description: string;
  brew?: string;
  copyLabel?: string;
};

function CopyButton({ value, label, copiedKey, onCopy }: CopyButtonProps) {
  const isCopied = copiedKey === label;

  return (
    <button
      type="button"
      className="button secondary database-copy-button"
      onClick={() => onCopy(value, label)}
      aria-label={`Copy ${label}`}
      title={`Copy ${label}`}
    >
      {isCopied ? 'Copied' : 'Copy'}
    </button>
  );
}

export function DatabaseView() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const passwordValue = import.meta.env.VITE_DB_PASSWORD || 'error';
  const displayedPassword = passwordVisible ? passwordValue : '••••••••';

  const handleCopy = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      window.setTimeout(() => {
        setCopiedKey(current => (current === key ? null : current));
      }, 1600);
    } catch {
      setCopiedKey(null);
    }
  };

  const downloadFile = (downloadUrl: string): void => {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('target', '_blank');

    // Create/click a temporary hidden link
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadGoogleFile = (fileId: string): void => {
    // Use 'uc' for direct downloads of uploaded files
    downloadFile(`https://drive.google.com/uc?export=download&id=${fileId}`)
  }

  const handleDownloadCertClick = () => {
    const fileId = import.meta.env.VITE_DB_CERT_FILE_ID;
    if(!fileId) {
      alert('ERROR: Certificate File Not Found');
      return;
    }
    downloadGoogleFile(fileId);
  };

  function DatabaseClientCard({
    href,
    badge,
    title,
    description,
    brew,
    copyLabel,
  }: DatabaseClientCardProps) {
    const handleCopyRowClick = (e: MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      const target = e.target as HTMLElement;
      if (target.closest('button')) return;

      handleCopy(cmd, label);
    };

    const cmd = `brew install ${brew || slugify(title)}`;
    const label = copyLabel || `${title} install`;

    return (
      <a className="database-client-card" href={href}>
        <div className="database-client-header">
          <strong>{title}</strong>
          {badge ? <span className="badge subtle">{badge}</span> : null}
        </div>
        <span>{description}</span>
        <div className="database-copy-row" onClick={handleCopyRowClick}>
          <code>{cmd}</code>
          <CopyButton
            value={cmd}
            label={label}
            copiedKey={copiedKey}
            onCopy={handleCopy}
          />
        </div>
      </a>
    );
  }

  return (
    <section className="card section-stack database-view">
      <div className="section-header">
        <div>
          <h2>Direct database access</h2>
          <p>If you are comfortable with SQL, you can connect directly to the raw PostgreSQL database for ad hoc queries,
          validation, and deeper inspection beyond the UI.</p>
        </div>
      </div>

      <div className="database-grid">
        <div className="setup-block database-block">
          <div className="database-block-header stretch">
            <div>
              <span className="badge subtle">Read-only team access</span>
              <h3>Connection details</h3>
              <p>Use these values with a SQL client to create a secure connection.</p>
            </div>
          </div>

          <div className="database-kv-grid">
            <div className="database-kv-card">
              <span>Host</span>
              <div className="database-copy-row">
                <code>aws-1-us-east-1.pooler.supabase.com</code>
                <CopyButton value="aws-1-us-east-1.pooler.supabase.com" label="Host" copiedKey={copiedKey} onCopy={handleCopy}
                />
              </div>
            </div>
            <div className="database-kv-card">
              <span>Port</span>
              <div className="database-copy-row">
                <code>6543</code>
                <CopyButton value="6543" label="Port" copiedKey={copiedKey} onCopy={handleCopy} />
              </div>
            </div>
            <div className="database-kv-card">
              <span>User</span>
              <div className="database-copy-row">
                  <code>team_read.czrhonjhnuvcsugpkpcq</code>
                  <CopyButton value="team_read.czrhonjhnuvcsugpkpcq" label="User" copiedKey={copiedKey} onCopy={handleCopy} />
              </div>
            </div>
            <div className="database-secret-card">
              <span>Password</span>
              <div className="database-copy-row">
                <code>{displayedPassword}</code>
                <div className="database-copy-actions">
                  <button
                    type="button"
                    className="button secondary database-reveal-button"
                    onClick={() => setPasswordVisible(current => !current)}
                    aria-label={passwordVisible ? 'Hide password' : 'Reveal password'}
                  >
                    {passwordVisible ? 'Hide' : 'Reveal'}
                  </button>
                  <CopyButton
                    value={passwordValue}
                    label="Password"
                    copiedKey={copiedKey}
                    onCopy={handleCopy}
                  />
                </div>
              </div>
            </div>
            {/* <div className="database-kv-card">
              <span>Database</span>
              <div className="database-copy-row">
                <code>postgres</code>
                <CopyButton value="postgres" label="Database" copiedKey={copiedKey} onCopy={handleCopy} />
              </div>
            </div> */}
          </div>
        </div>

        <div className="database-sidebar">
          <div className="setup-block database-block">
            <div className="database-block-header">
              <div>
                <h3>SSL configuration (required)</h3>
                <p>The database rejects non-SSL connections.</p>
                <p>Use the certificate below and enable SSL or TLS in your client before attempting to connect.</p>
              </div>
            </div>

            <div className="database-secret-card">
              <span>SSL certificate</span>
              <div className="database-action-row stretch">
                <button className="button white database-cert-link" onClick={handleDownloadCertClick}>
                {/* <a className="button white database-cert-link" href={certDownloadLink}> */}
                  <span aria-hidden="true" className="database-cert-link-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" x2="12" y1="15" y2="3"></line>
                    </svg>
                  </span>
                  <span>Download certificate</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="setup-block database-block">
        <div className="database-block-header">
          <div>
            <h3>Recommended SQL clients</h3>
            <p>Any PostgreSQL client should work, but these are solid options for macOS and general use.</p>
          </div>
        </div>

        <div className="database-client-grid">
          <DatabaseClientCard
            href="https://eggerapps.at/postico2/"
            badge="Top choice"
            title="Postico"
            description="Native macOS client with a polished interface."
          />

          <DatabaseClientCard
            href="https://www.pgadmin.org/"
            title="pgAdmin"
            description="Full-featured PostgreSQL admin tool."
            brew="pgadmin4"
          />

          <DatabaseClientCard
            href="https://www.beekeeperstudio.io/"
            title="Beekeeper Studio"
            description="Clean cross-platform SQL editor and browser."
          />

          <DatabaseClientCard
            href="https://dbeaver.io/"
            title="DBeaver Community"
            description="Flexible general-purpose database client."
          />
        </div>
      </div>
    </section>
  );
}
