import { useEffect, useMemo, useRef, useState } from 'react';
import { AppShell } from './components/AppShell';
import { LoginScreen } from './components/LoginScreen';
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
import { TAB_KEYS } from './config';
import type { ReviewRecord, ReviewStatus, TabKey } from './types';

export default function App() {
  const auth = useAuth();
  const { reviews, commentsByReview, loading, saving, error, setError, saveReview, deleteReview, addComment } = useReviews(auth.profile);
  const [activeTab, setActiveTab] = useState<TabKey>('workspace');
  const [currentReview, setCurrentReview] = useState<ReviewRecord>(() => createEmptyReview(''));
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ReviewStatus>('all');
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const pendingReviewIdRef = useRef<string | null>(null);
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
      if(!auth.profile) {
        setHasSyncedInitialHash(true);
        return;
      }

      const { tab, reviewId, compareIds: hashCompareIds } = parseHash();
      const nextTab = isTabKey(tab) ? tab : 'workspace';
      setActiveTab(nextTab);

      if (nextTab === 'compare') {
        setCompareIds(hashCompareIds);
      }

      if (nextTab === 'workspace') {
        if (reviewId && reviewId !== 'new') {
          const existing = reviews.find((review) => review.id === reviewId);
          if (existing) {
            setCurrentReview(existing);
            pendingReviewIdRef.current = null;
          } else {
            pendingReviewIdRef.current = reviewId;
          }
        } else {
          setCurrentReview(createEmptyReview(auth.profile?.displayName || ''));
          pendingReviewIdRef.current = null;
        }
      }

      setHasSyncedInitialHash(true);
    }

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, [reviews, auth.profile]);

  useEffect(() => {
    if (!auth.profile || !pendingReviewIdRef.current) return;
    const found = reviews.find((review) => review.id === pendingReviewIdRef.current);
    if (found) {
      setCurrentReview(found);
      pendingReviewIdRef.current = null;
    }
  }, [auth.profile, reviews]);

  useEffect(() => {
    if (!auth.profile || !hasSyncedInitialHash) return;

    const reviewIdForHash = reviews.some((review) => review.id === currentReview.id) ? currentReview.id : 'new';
    const desiredHash = buildHash(activeTab, reviewIdForHash, compareIds);
    if (window.location.hash !== desiredHash) {
      window.history.replaceState(null, '', desiredHash);
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
    pendingReviewIdRef.current = null;
    setCurrentReview(createEmptyReview(auth.profile?.displayName || ''));
    setActiveTab('workspace');
    setError('');
  }

  function handleOpen(review: ReviewRecord) {
    pendingReviewIdRef.current = null;
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

      {activeTab === 'workspace' ? (
        <div className="workspace-grid">
          <ReviewForm
            profile={auth.profile}
            review={currentReview}
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
