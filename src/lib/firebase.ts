import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let db: Firestore;

function initializeFirebase() {
  if (typeof window !== 'undefined') {
    if (!getApps().length) {
      try {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        console.log("Firebase initialized");
      } catch (error) {
        console.error("Error initializing Firebase", error);
      }
    } else {
      app = getApp();
      db = getFirestore(app);
    }
  }
}

initializeFirebase();

export const getDb = (): Firestore => {
  if (!db) {
    // This case might happen if the initial call was on the server.
    // We re-initialize here to be safe, but it should ideally be initialized once.
    initializeFirebase();
  }
  return db;
};
