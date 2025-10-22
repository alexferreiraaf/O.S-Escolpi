"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  type User, 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  type Auth,
} from 'firebase/auth';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// Helper function to initialize Firebase
function getFirebaseServices(): { app: FirebaseApp; auth: Auth; db: Firestore } {
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const auth = getAuth(app);
  const db = getFirestore(app);
  return { app, auth, db };
}

interface AuthContextType {
  user: User | null;
  userId: string | null;
  isAuthReady: boolean;
  login: (email: string, pass: string) => Promise<any>;
  signup: (email: string, pass: string) => Promise<any>;
  logout: () => Promise<void>;
  getServices: () => { app: FirebaseApp; auth: Auth; db: Firestore };
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  userId: null, 
  isAuthReady: false,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  getServices: getFirebaseServices,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const { auth } = getFirebaseServices();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, [auth]);

  const login = (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  };
  
  const signup = (email: string, pass: string) => {
    return createUserWithEmailAndPassword(auth, email, pass);
  };

  const logout = () => {
    return signOut(auth);
  }

  const value = { 
    user,
    userId: user?.uid || null,
    isAuthReady,
    login,
    signup,
    logout,
    getServices: getFirebaseServices,
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
