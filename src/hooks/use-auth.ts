'use client';

import { useState, useEffect } from 'react';
import { getSupabase } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. getSession() for instant UI (reads from local storage, no network)
    getSupabase().auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch(() => {
      setUser(null);
      setLoading(false);
    });

    // 2. getUser() in background to validate server-side (corrects stale sessions)
    getSupabase().auth.getUser().then(({ data: { user: validatedUser }, error }) => {
      if (error) {
        setUser(null);
      } else {
        setUser(validatedUser);
      }
    }).catch(() => {
      // Network error — keep the session-based user as-is
    });

    const {
      data: { subscription },
    } = getSupabase().auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, isAuthenticated: !!user, loading };
}
