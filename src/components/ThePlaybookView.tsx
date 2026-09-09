import { useRef } from 'react';
import { useGoogleDoc } from '../hooks/useGoogleDoc';

export function ThePlaybookView() {
  const publishedUrl = import.meta.env.VITE_PLAYBOOK_GDOC_PUB_URL;
  const commentsUrl = import.meta.env.VITE_PLAYBOOK_GDOC_SHARE_URL;
  if (!publishedUrl) {
    return (
      <section className="card section-stack playbook-view">
        The Playbook URL is not set in the environment variables.
      </section>
    );
  }
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { loading, error } = useGoogleDoc({ publishedUrl, containerRef });

  function onViewInGoogleDocs() {
    window.open(commentsUrl, '_blank');
  }

  return (
    <section className="card section-stack playbook-view">
      {commentsUrl && (
        <button id="view-in-google-docs" className="button primary nobreak" onClick={onViewInGoogleDocs} type="button">
          View &amp; Comment in Google Docs
        </button>
      )}
      <div className="gdoc-wrapper">
        {loading && (
          <span className="iridescent-text">Loading the playbook&hellip;</span>
        )}

        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        <div
          ref={containerRef}
          className="gdoc-content"
          style={{ display: loading ? 'none' : 'block' }}
        />
      </div>
    </section>
  );
}
