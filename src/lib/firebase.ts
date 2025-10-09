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

// Singleton pattern to initialize Firebase only once
function getFirebaseApp(): FirebaseApp {
  if (getApps().length === 0) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}

function getFirebaseDb(): Firestore {
  return getFirestore(getFirebaseApp());
}

export const app = getFirebaseApp();
export const auth = getFirebaseAuth();
export const db = getFirebaseDb();
