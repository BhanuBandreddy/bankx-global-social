import React, { createContext, useContext, useEffect, useState } from 'react';
import { authClient, User, Profile } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authClient.isAuthenticated()) {
          const userData = await authClient.getUser();
          if (userData) {
            setUser(userData.user);
            setProfile(userData.profile);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        authClient.signOut();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authClient.signIn(email, password);
      setUser(response.user);
      
      // Get profile data
      const userData = await authClient.getUser();
      if (userData) {
        setProfile(userData.profile);
      }
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const response = await authClient.signUp(email, password, fullName);
      setUser(response.user);
      
      // Get profile data
      const userData = await authClient.getUser();
      if (userData) {
        setProfile(userData.profile);
      }
    } catch (error) {
      throw error;
    }
  };

  const signOut = () => {
    authClient.signOut();
    setUser(null);
    setProfile(null);
  };

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};