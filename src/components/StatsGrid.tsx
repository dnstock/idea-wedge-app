interface StatsGridProps {
  total: number;
  approved: number;
  deferred: number;
  rejected: number;
}

export function StatsGrid({ total, approved, deferred, rejected }: StatsGridProps) {
  return (
    <section className="stats-grid">
      <article className="stat-card card">
        <span>Total reviews</span>
        <strong>{total}</strong>
      </article>
      <article className="stat-card card success-surface">
        <span>Approved</span>
        <strong>{approved}</strong>
      </article>
      <article className="stat-card card warning-surface">
        <span>Deferred</span>
        <strong>{deferred}</strong>
      </article>
      <article className="stat-card card danger-surface">
        <span>Rejected</span>
        <strong>{rejected}</strong>
      </article>
    </section>
  );
}
