"use client";

import { useState, useEffect } from 'react';
import type { ServiceOrder } from '@/lib/types';
import { useAuth } from '@/contexts/auth-context';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, collection, query, orderBy, onSnapshot } from 'firebase/firestore';

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


export function useServiceOrders() {
    const { user } = useAuth();
    const [osList, setOsList] = useState<ServiceOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        };

        let unsubscribe: () => void;

        try {
            const app = getFirebaseApp();
            const db = getFirestore(app);
            
            const collectionPath = `service_orders`;
            
            const q = query(
                collection(db, collectionPath),
                orderBy('createdAt', 'desc')
            );

            unsubscribe = onSnapshot(q, (snapshot) => {
                const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceOrder));
                setOsList(orders);
                setLoading(false);
            }, (err) => {
                console.error("Error fetching service orders:", err);
                setError("Failed to load service orders.");
                setLoading(false);
            });
        } catch(err) {
            console.error("Error setting up Firestore listener:", err);
            setError("Failed to set up listener.");
            setLoading(false);
        }

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [user]);

    return { osList, loading, error };
}
