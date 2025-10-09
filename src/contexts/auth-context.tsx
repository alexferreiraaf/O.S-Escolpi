"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User, Auth } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  userId: string | null;
  isAuthReady: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, userId: null, isAuthReady: false });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    let unsubscribe: () => void;
    
    const initializeAuth = async () => {
      const { onAuthStateChanged } = await import('firebase/auth');
      const auth = getFirebaseAuth();
      
      unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        if (!isAuthReady) {
          setIsAuthReady(true);
        }
      });
    };
    
    initializeAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = { 
    user,
    userId: user?.uid || null,
    isAuthReady 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
