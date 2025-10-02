"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signInWithCustomToken, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getInjectedGlobals } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  userId: string | null;
  isAuthReady: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, userId: 'public-user', isAuthReady: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    // Since we are moving away from auth, we can simplify this.
    // We'll just set it to ready.
    setIsAuthReady(true);
  }, []);

  const value = { user: null, userId: 'public-user', isAuthReady: true };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
