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

let firebaseApp: FirebaseApp | undefined;
let firebaseAuth: Auth | undefined;
let firestoreDb: Firestore | undefined;

function getFirebaseServices() {
  // This function now just returns the services, it doesn't initialize.
  return { app: firebaseApp, auth: firebaseAuth, db: firestoreDb };
}

interface AuthContextType {
  user: User | null;
  userId: string | null;
  isAuthReady: boolean;
  login: (email: string, pass: string) => Promise<any>;
  signup: (email: string, pass: string) => Promise<any>;
  logout: () => Promise<void>;
  getServices: () => { app?: FirebaseApp; auth?: Auth; db?: Firestore };
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  userId: null, 
  isAuthReady: false,
  login: async () => { throw new Error("Firebase Auth is not initialized."); },
  signup: async () => { throw new Error("Firebase Auth is not initialized."); },
  logout: async () => { throw new Error("Firebase Auth is not initialized."); },
  getServices: getFirebaseServices,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  useEffect(() => {
    // This effect runs only on the client-side
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
    const { auth } = getFirebaseServices();
    if (!auth) throw new Error("Firebase Auth is not initialized.");
    return signInWithEmailAndPassword(auth, email, pass);
  };
  
  const signup = (email: string, pass: string) => {
    const { auth } = getFirebaseServices();
    if (!auth) throw new Error("Firebase Auth is not initialized.");
    return createUserWithEmailAndPassword(auth, email, pass);
  };

  const logout = () => {
    const { auth } = getFirebaseServices();
    if (!auth) throw new Error("Firebase Auth is not initialized.");
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
