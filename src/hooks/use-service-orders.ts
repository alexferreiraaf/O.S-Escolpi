"use client";

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, where, Firestore } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ServiceOrder } from '@/lib/types';
import { useAuth } from '@/contexts/auth-context';

export function useServiceOrders() {
    const { user } = useAuth();
    const [osList, setOsList] = useState<ServiceOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            // Don't fetch if user is not logged in.
            // The page will redirect anyway.
            return;
        };

        const collectionPath = `service_orders`;
        
        const q = query(
            collection(db, collectionPath),
            orderBy('createdAt', 'desc')
        );

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
    }, [user]);

    return { osList, loading, error };
}
