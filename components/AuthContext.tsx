import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { UserProfile } from '../types';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  authUser: User | null;
  loading: boolean;
  signUp: (email: string, password: string, profile: Omit<UserProfile, 'id' | 'email'>) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const fetchProfile = async (userId: string, email: string): Promise<UserProfile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      // Try by email as fallback (for profiles created before auth migration)
      const { data: emailData } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (emailData) {
        return {
          id: emailData.id,
          email: emailData.email,
          role: emailData.role,
          name: emailData.name,
          course: emailData.course,
          university: emailData.university,
          ageRange: emailData.age_range,
          gender: emailData.gender,
          state: emailData.state,
          education: emailData.education,
          employment: emailData.employment,
        };
      }
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      role: data.role,
      name: data.name,
      course: data.course,
      university: data.university,
      ageRange: data.age_range,
      gender: data.gender,
      state: data.state,
      education: data.education,
      employment: data.employment,
    };
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setAuthUser(s?.user ?? null);
      if (s?.user) {
        fetchProfile(s.user.id, s.user.email || '').then(profile => {
          setUser(profile);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setAuthUser(s?.user ?? null);
      if (s?.user) {
        fetchProfile(s.user.id, s.user.email || '').then(setUser);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, profile: Omit<UserProfile, 'id' | 'email'>): Promise<{ error?: string }> => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };

    if (data.user) {
      const payload = {
        id: data.user.id,
        email,
        role: profile.role,
        name: profile.name,
        course: profile.course,
        university: profile.university,
        age_range: profile.ageRange,
        gender: profile.gender,
        state: profile.state,
        education: profile.education,
        employment: profile.employment,
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert([payload], { onConflict: 'id' });

      if (profileError) return { error: profileError.message };
    }

    return {};
  };

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setAuthUser(null);
  };

  const resetPassword = async (email: string): Promise<{ error?: string }> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) return { error: error.message };
    return {};
  };

  return (
    <AuthContext.Provider value={{
      user, session, authUser, loading,
      signUp, signIn, signOut, resetPassword,
      showAuthModal, setShowAuthModal,
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
