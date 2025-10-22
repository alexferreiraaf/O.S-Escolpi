"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  type User, 
  getAuth, 
  onAuthStateChanged, 
  signOut,
  signInAnonymously,
  type Auth,
} from 'firebase/auth';
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

interface AuthContextType {
  user: User | null;
  userId: string | null;
  isAuthReady: boolean;
  logout: () => Promise<void>;
  loginAnonymously: () => Promise<any>;
  getServices: () => { app: FirebaseApp; auth: Auth; db: Firestore };
}

let firebaseApp: FirebaseApp;
let firebaseAuth: Auth;
let firestoreDb: Firestore;

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  userId: null, 
  isAuthReady: false,
  logout: async () => { throw new Error("Firebase Auth is not initialized."); },
  loginAnonymously: async () => { throw new Error("Firebase Auth is not initialized."); },
  getServices: () => {
    if (!firebaseApp || !firebaseAuth || !firestoreDb) {
      throw new Error("Firebase services are not available.");
    }
    return { app: firebaseApp, auth: firebaseAuth, db: firestoreDb };
  },
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  useEffect(() => {
    const isConfigValid = firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId;

    if (isConfigValid) {
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
    } else {
        console.error("Firebase config keys are missing. Please set them in your environment variables.");
        setIsAuthReady(true); 
    }
  }, []);

  const logout = () => {
    if (!firebaseAuth) throw new Error("Firebase Auth is not initialized.");
    return signOut(firebaseAuth);
  }
  
  const loginAnonymously = () => {
    if (!firebaseAuth) throw new Error("Firebase Auth is not initialized.");
    return signInAnonymously(firebaseAuth);
  };

  const value = { 
    user,
    userId: user?.uid || null,
    isAuthReady,
    logout,
    loginAnonymously,
    getServices: () => {
      if (!firebaseApp || !firebaseAuth || !firestoreDb) {
        throw new Error("Firebase services are not available.");
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
