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

// This function now ONLY gets services, it does not initialize them.
// Initialization is handled in the AuthProvider's useEffect hook.
function getFirebaseServices() {
  if (firebaseApp) {
    return { app: firebaseApp, auth: firebaseAuth, db: firestoreDb };
  }
  return { app: undefined, auth: undefined, db: undefined };
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
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  getServices: getFirebaseServices,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  useEffect(() => {
    // This effect runs only on the client-side
    if (!firebaseApp) {
      // Check if all config keys are present before initializing
      const isConfigValid = 
        firebaseConfig.apiKey &&
        firebaseConfig.authDomain &&
        firebaseConfig.projectId;
        
      if (isConfigValid) {
        if (getApps().length > 0) {
          firebaseApp = getApp();
        } else {
          firebaseApp = initializeApp(firebaseConfig);
        }
        firebaseAuth = getAuth(firebaseApp);
        firestoreDb = getFirestore(firebaseApp);
      } else {
        console.warn("Firebase config is incomplete. Firebase services will not be available. Check your .env.local file or Vercel environment variables.");
        setIsAuthReady(true); // Mark as ready to unblock UI, but services will fail.
        return;
      }
    }

    if (!firebaseAuth) {
        console.warn("Firebase Auth is not initialized. Check your Firebase config.");
        setIsAuthReady(true);
        return;
    }

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