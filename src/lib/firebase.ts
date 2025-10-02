import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

// This code will only run on the client side, where window is available.
if (typeof window !== 'undefined') {
  if (getApps().length === 0) {
    const win = window as any;
    const injectedConfig = win.__firebase_config ? JSON.parse(win.__firebase_config) : firebaseConfig;
    app = initializeApp(injectedConfig);
  } else {
    app = getApp();
  }
  auth = getAuth(app);
  db = getFirestore(app);
}

// @ts-ignore
export { app, auth, db };

export const getInjectedGlobals = () => {
    if (typeof window === 'undefined') {
        return {
            appId: 'default-app-id',
            initialAuthToken: null,
        };
    }
    const win = window as any;
    return {
        appId: win.__app_id || 'default-app-id',
        initialAuthToken: win.__initial_auth_token || null,
    };
};
