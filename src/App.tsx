import { useMemo, useState } from 'react';
import { AppShell } from './components/AppShell';
import { AuthPanel } from './components/AuthPanel';
import { CommentsPanel } from './components/CommentsPanel';
import { CompareView } from './components/CompareView';
import { DecisionCard } from './components/DecisionCard';
import { ReviewForm } from './components/ReviewForm';
import { SavedReviewsView } from './components/SavedReviewsView';
import { SetupView } from './components/SetupView';
import { StatsGrid } from './components/StatsGrid';
import { Tabs } from './components/Tabs';
import { createEmptyReview } from './lib/demoData';
import { getVerdict } from './lib/scoring';
import { useAuth } from './hooks/useAuth';
import { useReviews } from './hooks/useReviews';
import type { ReviewRecord, ReviewStatus, TabKey } from './types';

export default function App() {
  const auth = useAuth();
  const { reviews, commentsByReview, loading, saving, error, setError, saveReview, deleteReview, addComment } = useReviews(auth.profile);
  const [activeTab, setActiveTab] = useState<TabKey>('workspace');
  const [currentReview, setCurrentReview] = useState<ReviewRecord>(() => createEmptyReview(''));
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ReviewStatus>('all');
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const verdict = useMemo(() => getVerdict(currentReview), [currentReview]);
  const currentComments = commentsByReview[currentReview.id] ?? [];
  const isCurrentReviewSaved = reviews.some((review) => review.id === currentReview.id);

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const haystack = [review.ideaName, review.summary, review.ownerName, review.tags, review.category].join(' ').toLowerCase();
      const matchesQuery = !query || haystack.includes(query.toLowerCase());
      const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [query, reviews, statusFilter]);

  const compareReviews = useMemo(() => reviews.filter((review) => compareIds.includes(review.id)).slice(0, 2), [compareIds, reviews]);

  const stats = useMemo(() => {
    return {
      total: reviews.length,
      approved: reviews.filter((review) => review.decision === 'Approve').length,
      deferred: reviews.filter((review) => review.decision === 'Defer').length,
      rejected: reviews.filter((review) => review.decision === 'Reject').length,
    };
  }, [reviews]);

  function syncReview(next: ReviewRecord) {
    setCurrentReview(next);
    setError('');
  }

  async function handleSave() {
    try {
      const payload = {
        ...currentReview,
        authorName: currentReview.authorName || auth.profile?.displayName || 'Local demo user',
      };
      const saved = await saveReview(payload);
      setCurrentReview(saved);
    } catch {
      // handled in hook state
    }
  }

  function handleNewReview() {
    setCurrentReview(createEmptyReview(auth.profile?.displayName || ''));
    setActiveTab('workspace');
    setError('');
  }

  function handleOpen(review: ReviewRecord) {
    setCurrentReview(review);
    setActiveTab('workspace');
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm('Delete this review?');
    if (!confirmed) return;
    try {
      await deleteReview(id);
      if (currentReview.id === id) {
        handleNewReview();
      }
    } catch {
      // handled in hook state
    }
  }

  function handleToggleCompare(id: string) {
    setCompareIds((current) => {
      if (current.includes(id)) return current.filter((value) => value !== id);
      return [...current, id].slice(-2);
    });
  }

  async function handleAddComment(body: string) {
    try {
      await addComment(currentReview.id, body);
    } catch {
      // handled in hook state
    }
  }

  return (
    <AppShell
      headerRight={
        <AuthPanel
          isConfigured={auth.isConfigured}
          loading={auth.loading}
          profile={auth.profile}
          onSignIn={auth.signInWithGoogle}
          onSignOut={auth.signOut}
        />
      }
    >
      <StatsGrid total={stats.total} approved={stats.approved} deferred={stats.deferred} rejected={stats.rejected} />
      <Tabs activeTab={activeTab} onChange={setActiveTab} />

      {error ? <div className="error-banner">{error}</div> : null}

      {activeTab === 'workspace' ? (
        <div className="workspace-grid">
          <ReviewForm review={currentReview} onChange={syncReview} onSave={handleSave} onReset={handleNewReview} saving={saving} />
          <div className="workspace-sidebar">
            <DecisionCard review={currentReview} verdict={verdict} />
            <CommentsPanel canComment={isCurrentReviewSaved} comments={currentComments} onAddComment={handleAddComment} />
          </div>
        </div>
      ) : null}

      {activeTab === 'reviews' ? (
        <SavedReviewsView
          reviews={filteredReviews}
          query={query}
          statusFilter={statusFilter}
          compareIds={compareIds}
          loading={loading}
          onQueryChange={setQuery}
          onStatusFilterChange={setStatusFilter}
          onOpen={handleOpen}
          onDelete={handleDelete}
          onToggleCompare={handleToggleCompare}
        />
      ) : null}

      {activeTab === 'compare' ? <CompareView reviews={compareReviews} /> : null}
      {activeTab === 'setup' ? <SetupView /> : null}
    </AppShell>
  );
}
