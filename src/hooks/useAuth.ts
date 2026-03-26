import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { UserProfile } from '../types';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

function deriveDisplayName(session: Session | null): string {
  if (!session?.user) return 'Local demo user';
  const metadata = session.user.user_metadata as Record<string, unknown> | undefined;
  return String(metadata?.full_name || metadata?.name || session.user.email || 'Authenticated user');
}

function getAvatarUrl(session: Session | null): string | null {
  if (!session?.user) return null;
  const metadata = session.user.user_metadata as Record<string, unknown> | undefined;
  return String(metadata?.avatar_url || null);
}

function mapProfile(session: Session | null): UserProfile | null {
  if (!session?.user) return null;

  return {
    id: session.user.id,
    email: session.user.email ?? null,
    displayName: deriveDisplayName(session),
    avatarUrl: getAvatarUrl(session),
  };
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setProfile(mapProfile(data.session));
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setProfile(mapProfile(nextSession));
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signInWithGoogle() {
    if (!supabase) return;

    const redirectTo = window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });

    if (error) throw error;
  }

  async function signOut() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  const isAuthenticated = !loading && !!profile;

  return {
    session,
    profile,
    loading,
    isAuthenticated,
    isConfigured: isSupabaseConfigured,
    signInWithGoogle,
    signOut,
  };
}
