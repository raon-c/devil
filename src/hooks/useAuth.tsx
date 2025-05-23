'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthChangeEvent, Session, Subscription } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabaseClient';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  // session: Session | null; // Optionally expose session if needed elsewhere
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  // const [session, setSession] = useState<Session | null>(null); // Optional
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      console.warn("Supabase client not initialized in AuthProvider. User auth will not work.");
      return;
    }

    let mounted = true; // Handle component unmounting

    const getInitialUser = async () => {
      try {
        const { data: { user: currentUser }, error } = await supabase.auth.getUser();
        if (mounted) {
          if (error && error.message !== 'No active session') {
            console.error('Error fetching initial user:', error);
          }
          setUser(currentUser ?? null);
        }

        // const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        // if (sessionError) console.error('Error fetching initial session:', sessionError);
        // setSession(currentSession ?? null);

      } catch (e) {
        if (mounted) console.error("Exception fetching initial user/session:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    getInitialUser();

    const { data: authSubscription } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (mounted) {
          setUser(session?.user ?? null);
          // setSession(session ?? null);
        }
      }
    );

    return () => {
      mounted = false;
      authSubscription?.subscription.unsubscribe(); // Correct way to unsubscribe
    };
   
  }, []); // Removed loading from dependency array, initial check should run once.

  const handleSignOut = async () => {
    if (!supabase) {
      console.warn("Supabase client not initialized. Cannot sign out.");
      return;
    }
    // setLoading(true); // Optional: show loading during sign out
    try {
      await supabase.auth.signOut();
      // setUser(null); // onAuthStateChange will handle this
      // setSession(null);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      // setLoading(false); // Optional: hide loading after sign out
    }
  };

  const value = {
    user,
    // session,
    loading,
    signOut: handleSignOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 