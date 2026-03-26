import { useEffect, useMemo, useState } from 'react';
import { seededComments, seededReviews } from '../lib/demoData';
import { mapDbComment, mapDbReview, mapReviewForDb } from '../lib/mappers';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { getOverallScore, getVerdict } from '../lib/scoring';
import type { ReviewComment, ReviewRecord, UserProfile } from '../types';

function sortReviews(items: ReviewRecord[]): ReviewRecord[] {
  return [...items].sort((a, b) => {
    if (a.isDemo !== b.isDemo) return a.isDemo ? 1 : -1;  // always put real records first
    return b.updatedAt.localeCompare(a.updatedAt);
  });
}

export function useReviews(profile: UserProfile | null) {
  const [reviews, setReviews] = useState<ReviewRecord[]>(sortReviews(seededReviews));
  const [commentsByReview, setCommentsByReview] = useState<Record<string, ReviewComment[]>>(seededComments);
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    async function load() {
      if (!supabase || !profile) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      const [reviewsResult, commentsResult] = await Promise.all([
        supabase.from('idea_reviews').select('*').order('is_demo', { ascending: true }).order('updated_at', { ascending: false }),
        supabase.from('idea_comments').select('*').order('created_at', { ascending: false }),
      ]);

      if (reviewsResult.error) {
        setError(reviewsResult.error.message);
        setLoading(false);
        return;
      }

      const nextReviews = (reviewsResult.data ?? []).map(mapDbReview);
      setReviews(sortReviews(nextReviews));

      if (!commentsResult.error) {
        const grouped = (commentsResult.data ?? []).map(mapDbComment).reduce<Record<string, ReviewComment[]>>((acc, current) => {
          if (!acc[current.reviewId]) acc[current.reviewId] = [];
          acc[current.reviewId].push(current);
          return acc;
        }, {});
        setCommentsByReview(grouped);
      }

      setLoading(false);
    }

    load();
  }, [profile]);

  const reviewIndex = useMemo(() => {
    return reviews.reduce<Record<string, ReviewRecord>>((acc, current) => {
      acc[current.id] = current;
      return acc;
    }, {});
  }, [reviews]);

  async function saveReview(review: ReviewRecord): Promise<ReviewRecord> {
    const nextReview: ReviewRecord = {
      ...review,
      userId: profile?.id ?? null,
      authorName: review.authorName || profile?.displayName || 'Local demo user',
      updatedAt: new Date().toISOString(),
      overallScore: getOverallScore(review),
      decision: getVerdict(review).label,
    };

    setSaving(true);
    setError('');

    if (!supabase && !profile) {
      setReviews((current) => sortReviews([nextReview, ...current.filter((item) => item.id !== nextReview.id)]));
      setSaving(false);
      return nextReview;
    }

    if (supabase && !profile) {
      setSaving(false);
      const authError = new Error('Sign in before saving shared reviews.');
      setError(authError.message);
      throw authError;
    }

    const client = supabase!;
    const payload = mapReviewForDb(nextReview);
    const exists = Boolean(reviewIndex[nextReview.id]);
    const query = exists
      ? client.from('idea_reviews').update(payload).eq('id', nextReview.id).select().single()
      : client.from('idea_reviews').insert(payload).select().single();

    const { data, error: saveError } = await query;

    if (saveError) {
      setError(saveError.message);
      setSaving(false);
      throw saveError;
    }

    const mapped = mapDbReview(data as Record<string, unknown>);
    setReviews((current) => sortReviews([mapped, ...current.filter((item) => item.id !== mapped.id)]));
    setSaving(false);
    return mapped;
  }

  async function deleteReview(id: string): Promise<void> {
    setError('');

    if (!supabase && !profile) {
      setReviews((current) => current.filter((item) => item.id !== id));
      setCommentsByReview((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      return;
    }

    if (supabase && !profile) {
      const authError = new Error('Sign in before deleting shared reviews.');
      setError(authError.message);
      throw authError;
    }

    const client = supabase!;
    const { error: deleteError } = await client.from('idea_reviews').delete().eq('id', id);
    if (deleteError) {
      setError(deleteError.message);
      throw deleteError;
    }

    setReviews((current) => current.filter((item) => item.id !== id));
    setCommentsByReview((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  async function addComment(reviewId: string, body: string): Promise<ReviewComment> {
    const nextComment: ReviewComment = {
      id: crypto.randomUUID(),
      reviewId,
      body,
      createdAt: new Date().toISOString(),
      userId: profile?.id ?? null,
      authorName: profile?.displayName || 'Local demo user',
    };

    setError('');

    if (!supabase && !profile) {
      setCommentsByReview((current) => ({
        ...current,
        [reviewId]: [nextComment, ...(current[reviewId] ?? [])],
      }));
      return nextComment;
    }

    if (supabase && !profile) {
      const authError = new Error('Sign in before commenting on shared reviews.');
      setError(authError.message);
      throw authError;
    }

    const client = supabase!;
    const currentProfile = profile!;
    const { data, error: commentError } = await client
      .from('idea_comments')
      .insert({
        review_id: reviewId,
        body,
        user_id: currentProfile.id,
        author_name: currentProfile.displayName,
      })
      .select()
      .single();

    if (commentError) {
      setError(commentError.message);
      throw commentError;
    }

    const mapped = mapDbComment(data as Record<string, unknown>);
    setCommentsByReview((current) => ({
      ...current,
      [reviewId]: [mapped, ...(current[reviewId] ?? [])],
    }));
    return mapped;
  }

  return {
    reviews,
    commentsByReview,
    loading,
    saving,
    error,
    setError,
    saveReview,
    deleteReview,
    addComment,
  };
}
