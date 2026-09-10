import { useEffect, useMemo, useState } from 'react';
import { AppShell } from './components/AppShell';
import { LoginScreen } from './components/LoginScreen';
import { AuthPanel } from './components/AuthPanel';
import { CommentsPanel } from './components/CommentsPanel';
import { CompareView } from './components/CompareView';
import { DecisionCard } from './components/DecisionCard';
import { ReviewForm } from './components/ReviewForm';
import { SavedReviewsView } from './components/SavedReviewsView';
import { SetupView } from './components/SetupView';
import { DatabaseView } from './components/DatabaseView';
import { ThePlaybookView } from './components/ThePlaybookView';
import { StatsGrid } from './components/StatsGrid';
import { Tabs } from './components/Tabs';
import { createEmptyReview } from './lib/demoData';
import { getVerdict } from './lib/scoring';
import { useAuth } from './hooks/useAuth';
import { useReviews } from './hooks/useReviews';
import { TAB_KEYS, TAB_LABELS } from './config';
import type { ReviewRecord, ReviewStatus, TabKey } from './types';

export default function App() {
  const auth = useAuth();
  const { reviews, commentsByReview, loading, loaded, saving, error, setError, saveReview, deleteReview, addComment } = useReviews(auth.profile);
  const [activeTab, setActiveTab] = useState<TabKey>('workspace');
  const [currentReview, setCurrentReview] = useState<ReviewRecord>(() => createEmptyReview(''));
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ReviewStatus>('all');
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [hasSyncedInitialHash, setHasSyncedInitialHash] = useState(false);

  function buildHash(tab: TabKey, reviewId?: string, comparedIds: string[] = []) {
    if (tab === 'workspace') {
      return `#${tab}/${reviewId ?? 'new'}`;
    }

    if (tab === 'compare') {
      const serializedIds = comparedIds.filter(Boolean).slice(0, 2).join(',');
      return serializedIds ? `#${tab}/${serializedIds}` : `#${tab}`;
    }

    return `#${tab}`;
  }

  function parseHash(hash = window.location.hash) {
    const cleaned = hash.replace(/^#\/?/, '');
    const [tab, value] = cleaned.split('/');

    return {
      tab: (tab || 'workspace') as TabKey,
      reviewId: tab === 'workspace' ? value : undefined,
      compareIds: tab === 'compare' && value ? value.split(',').filter(Boolean).slice(0, 2) : [],
    };
  }

  function isTabKey(key: string): key is TabKey {
    return (TAB_KEYS as readonly string[]).includes(key);
  }

  useEffect(() => {
    function syncFromHash() {
      const { tab, reviewId, compareIds: hashCompareIds } = parseHash();
      const nextTab = isTabKey(tab) ? tab : 'workspace';
      setActiveTab(nextTab);

      if (!auth.profile || !loaded) {
        return;
      }

      if (nextTab === 'compare') {
        setCompareIds(hashCompareIds);
      }

      if (nextTab === 'workspace') {
        if (reviewId && reviewId !== 'new') {
          const existing = reviews.find((review) => review.id === reviewId);
          if (existing) {
            setCurrentReview(existing);
          } else {
            setCurrentReview(
              createEmptyReview(auth.profile.displayName || '')
            );
          }
        } else {
          setCurrentReview(
            createEmptyReview(auth.profile.displayName || '')
          );
        }
      }

      setHasSyncedInitialHash(true);
    }

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, [reviews, loaded, auth.profile]);

  useEffect(() => {
    if (!auth.profile || !hasSyncedInitialHash) return;

    const reviewIdForHash = reviews.some((review) => review.id === currentReview.id) ? currentReview.id : 'new';
    const desiredHash = buildHash(activeTab, reviewIdForHash, compareIds);
    if (window.location.hash !== desiredHash) {
      window.history.pushState(null, '', desiredHash);
    }
  }, [activeTab, compareIds, currentReview.id, hasSyncedInitialHash, reviews]);

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

  const compareReviews = useMemo(() => compareIds.map((id) => reviews.find((review) => review.id === id)).filter((review): review is ReviewRecord => Boolean(review)).slice(0, 2), [compareIds, reviews]);

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
      const existing = current.filter((value) => reviews.some((review) => review.id === value));
      return existing.length < 2 ? [...existing, id] : existing;
    });
  }

  async function handleAddComment(body: string) {
    try {
      await addComment(currentReview.id, body);
    } catch {
      // handled in hook state
    }
  }

  function getActiveTab() {
    return hasSyncedInitialHash ? activeTab : null;
  }

  if (!auth.isConfigured) {
    return <LoginScreen isConfigured={false} loading={false} onSignIn={() => Promise.resolve()} />;
  }

  if (auth.loading || !auth.profile) {
    return <LoginScreen isConfigured={auth.isConfigured} loading={auth.loading} onSignIn={auth.signInWithGoogle} />;
  }

  return (
    <AppShell
      onReset={handleNewReview}
      headerRight={
        <AuthPanel
          profile={auth.profile}
          onSignOut={auth.signOut}
        />
      }
    >
      <StatsGrid total={stats.total} approved={stats.approved} deferred={stats.deferred} rejected={stats.rejected} />
      <Tabs activeTab={activeTab} onChange={setActiveTab} />

      {error ? <div className="error-banner">{error}</div> : null}

      {!hasSyncedInitialHash ? (
        <section className="card loading-state">
          <div className="iridescent-text">Loading {TAB_LABELS[activeTab] || activeTab}&hellip;</div>
        </section>
      ) : null}

      {getActiveTab() === 'workspace' ? (
        <div className="workspace-grid">
          <ReviewForm
            profile={auth.profile}
            review={currentReview}
            comments={currentComments}
            onChange={syncReview}
            onSave={handleSave}
            saving={saving}
            isNewIdea={!isCurrentReviewSaved}
          />
          <div className="workspace-sidebar">
              <DecisionCard review={currentReview} verdict={verdict} />
              <CommentsPanel canComment={isCurrentReviewSaved} comments={currentComments} onAddComment={handleAddComment} />
          </div>
        </div>
      ) : null}

      {getActiveTab() === 'reviews' ? (
        <SavedReviewsView
          reviews={filteredReviews}
          commentsByReview={commentsByReview}
          query={query}
          statusFilter={statusFilter}
          compareIds={compareIds}
          selectedReviews={compareReviews}
          onCompare={() => setActiveTab('compare')}
          onClearCompare={() => setCompareIds([])}
          onQueryChange={setQuery}
          onStatusFilterChange={setStatusFilter}
          onOpen={handleOpen}
          onDelete={handleDelete}
          onToggleCompare={handleToggleCompare}
        />
      ) : null}

      {getActiveTab() === 'compare' ? <CompareView reviews={compareReviews} onOpen={handleOpen} onChooseReviews={() => setActiveTab('reviews')} /> : null}
      {getActiveTab() === 'setup' ? <SetupView /> : null}
      {getActiveTab() === 'database' ? <DatabaseView /> : null}
      {getActiveTab() === 'theplaybook' ? <ThePlaybookView /> : null}
    </AppShell>
  );
}
