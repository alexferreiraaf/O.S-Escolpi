"use client";

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/auth-context';
import type { ServiceOrder } from '@/lib/types';
import { getInjectedGlobals } from '@/lib/firebase';

export function useServiceOrders() {
    const { userId, isAuthReady } = useAuth();
    const [osList, setOsList] = useState<ServiceOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthReady) return;
        if (!userId) {
            setLoading(false);
            return;
        }

        const { appId } = getInjectedGlobals();
        const collectionPath = `artifacts/${appId}/users/${userId}/service_orders`;
        
        const q = query(collection(db, collectionPath), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceOrder));
            setOsList(orders);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching service orders:", err);
            setError("Failed to load service orders.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId, isAuthReady]);

    return { osList, loading, error };
}
