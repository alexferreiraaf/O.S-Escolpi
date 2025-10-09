"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';

// Helper function to initialize Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getFirebaseApp(): FirebaseApp {
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}


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
      const { getAuth, onAuthStateChanged } = await import('firebase/auth');
      const app = getFirebaseApp();
      const auth = getAuth(app);
      
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
