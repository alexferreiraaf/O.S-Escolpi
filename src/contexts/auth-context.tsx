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
import { firebaseConfig } from '../../firebase.config.js';

interface AuthContextType {
  user: User | null;
  userId: string | null;
  isAuthReady: boolean;
  login: (email: string, pass: string) => Promise<any>;
  signup: (email: string, pass: string) => Promise<any>;
  logout: () => Promise<void>;
  getServices: () => { app: FirebaseApp; auth: Auth; db: Firestore };
}

// These will be initialized on the client-side
let firebaseApp: FirebaseApp;
let firebaseAuth: Auth;
let firestoreDb: Firestore;


const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  userId: null, 
  isAuthReady: false,
  login: async () => { throw new Error("Firebase Auth is not initialized."); },
  signup: async () => { throw new Error("Firebase Auth is not initialized."); },
  logout: async () => { throw new Error("Firebase Auth is not initialized."); },
  getServices: () => {
    if (!firebaseApp) {
      throw new Error("Firebase is not initialized.");
    }
    return { app: firebaseApp, auth: firebaseAuth, db: firestoreDb };
  },
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  useEffect(() => {
    // This effect runs only once on the client-side
    if (getApps().length === 0) {
      firebaseApp = initializeApp(firebaseConfig);
    } else {
      firebaseApp = getApp();
    }
    firebaseAuth = getAuth(firebaseApp);
    firestoreDb = getFirestore(firebaseApp);

    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      setUser(user);
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const login = (email: string, pass: string) => {
    if (!firebaseAuth) throw new Error("Firebase Auth is not initialized.");
    return signInWithEmailAndPassword(firebaseAuth, email, pass);
  };
  
  const signup = (email: string, pass: string) => {
    if (!firebaseAuth) throw new Error("Firebase Auth is not initialized.");
    return createUserWithEmailAndPassword(firebaseAuth, email, pass);
  };

  const logout = () => {
    if (!firebaseAuth) throw new Error("Firebase Auth is not initialized.");
    return signOut(firebaseAuth);
  }

  const value = { 
    user,
    userId: user?.uid || null,
    isAuthReady,
    login,
    signup,
    logout,
    getServices: () => {
      if (!firebaseApp) {
        throw new Error("Firebase is not initialized.");
      }
      return { app: firebaseApp, auth: firebaseAuth, db: firestoreDb };
    },
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