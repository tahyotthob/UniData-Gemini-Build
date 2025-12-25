
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  login: (profile: UserProfile) => void;
  logout: () => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('unidata_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('unidata_user');
      }
    }
  }, []);

  const login = (profile: UserProfile) => {
    setUser(profile);
    localStorage.setItem('unidata_user', JSON.stringify(profile));
    setShowAuthModal(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('unidata_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, showAuthModal, setShowAuthModal }}>
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
