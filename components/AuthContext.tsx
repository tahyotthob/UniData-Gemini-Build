import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types';
import { supabase } from '../supabaseClient';
import { fetchMyProfile, fetchIsAdmin } from '../apiService';

interface AuthContextType {
  /** Completed profile of the signed-in user (null if signed out or profile not finished). */
  user: UserProfile | null;
  /** Verified email of the signed-in session, even before a profile exists. */
  sessionEmail: string | null;
  isAdmin: boolean;
  loading: boolean;
  sendCode: (email: string) => Promise<void>;
  verifyCode: (email: string, code: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const loadFor = useCallback(async (email: string | null) => {
    setSessionEmail(email);
    if (!email) {
      setUser(null);
      setIsAdmin(false);
      return;
    }
    try {
      const [profile, admin] = await Promise.all([fetchMyProfile(email), fetchIsAdmin()]);
      setUser(profile);
      setIsAdmin(admin);
    } catch {
      setUser(null);
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    // Clean up the insecure pre-auth localStorage identity.
    try { localStorage.removeItem('unidata_user'); } catch { /* ignore */ }

    supabase.auth.getSession().then(async ({ data }) => {
      await loadFor(data.session?.user.email ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      // Defer to avoid calling Supabase inside the auth callback.
      setTimeout(() => { loadFor(session?.user.email ?? null); }, 0);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadFor]);

  const sendCode = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    if (error) throw error;
  };

  const verifyCode = async (email: string, code: string) => {
    const { error } = await supabase.auth.verifyOtp({ email, token: code.trim(), type: 'email' });
    if (error) throw error;
  };

  const refreshProfile = async () => {
    await loadFor(sessionEmail);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    try { localStorage.removeItem('unidata_joined'); } catch { /* ignore */ }
  };

  return (
    <AuthContext.Provider value={{
      user, sessionEmail, isAdmin, loading, sendCode, verifyCode, refreshProfile, logout,
      showAuthModal, setShowAuthModal
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
