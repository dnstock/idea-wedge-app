import { useRef } from 'react';
import { useGoogleDoc } from '../hooks/useGoogleDoc';

export function ThePlaybookView() {
  const publishedUrl = import.meta.env.VITE_PLAYBOOK_GDOC_URL || '';
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { loading, error } = useGoogleDoc({ publishedUrl, containerRef });

  return (
    <section className="card section-stack playbook-view">
      {!publishedUrl && (
        <div className="p-4 text-red-500 border border-red-200 rounded">
          VITE_PLAYBOOK_GDOC_URL is not set in the environment variables.
        </div>
      ) || (
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
      )}
    </section>
  );
}
