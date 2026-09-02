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
          <div className="p-4 text-gray-500">Idea Wedge Playbook is loading...</div>
        )}

        {error && (
          <div className="p-4 text-red-500 border border-red-200 rounded">
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
