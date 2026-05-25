import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser]                 = useState(null);
  const [loading, setLoading]           = useState(true);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const recoveryRef = useRef(false);

  const clearRecoveryMode = useCallback(() => {
    recoveryRef.current = false;
    setRecoveryMode(false);
  }, []);

  useEffect(() => {
    // ── 1. Subscribe to auth changes ──────────────────────────────────
    // Only PASSWORD_RECOVERY sets recovery mode.
    // Only SIGNED_OUT clears it — all other events (SIGNED_IN, INITIAL_SESSION,
    // TOKEN_REFRESHED, USER_UPDATED) leave it untouched once set.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        recoveryRef.current = true;
        setRecoveryMode(true);
        setUser(session?.user ?? null);
      } else if (event === 'SIGNED_OUT') {
        recoveryRef.current = false;
        setRecoveryMode(false);
        setUser(null);
      } else {
        // SIGNED_IN, INITIAL_SESSION, TOKEN_REFRESHED, USER_UPDATED, etc.
        // Never clear recoveryMode here — just update the user
        setUser(session?.user ?? null);
      }
    });

    // ── 3. Get current session (triggers PKCE code exchange if needed) ─
    supabase.auth.getSession().then(({ data: { session } }) => {
      // Only set user & loading here if recovery mode wasn't set by the event above
      setUser(prev => session?.user ?? prev ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, recoveryMode, clearRecoveryMode }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
