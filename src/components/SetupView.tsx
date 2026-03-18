export function SetupView() {
  return (
    <section className="card section-stack setup-view">
      <div className="section-header">
        <div>
          <h2>Supabase setup</h2>
          <p>This project runs in demo mode without Supabase, then switches to shared mode when environment variables and tables exist.</p>
        </div>
      </div>

      <div className="setup-block">
        <h3>Environment variables</h3>
        <pre>{`VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key`}</pre>
      </div>

      <div className="setup-block">
        <h3>Deployment notes</h3>
        <ul>
          <li>Vercel: import the repo, set framework to Vite, output directory to <code>dist</code>.</li>
          <li>Cloudflare Pages: build command <code>npm run build</code>, output directory <code>dist</code>.</li>
          <li>Set the same Vite environment variables in either platform.</li>
        </ul>
      </div>

      <div className="setup-block">
        <h3>Recommended next extensions</h3>
        <ul>
          <li>organization scoping</li>
          <li>activity log and revision history</li>
          <li>attachment uploads to Supabase Storage</li>
          <li>Notion sync for approved ideas</li>
        </ul>
      </div>
    </section>
  );
}
