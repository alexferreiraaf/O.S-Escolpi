"use client";

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ServiceOrder } from '@/lib/types';
import { getInjectedGlobals } from '@/lib/firebase';

export function useServiceOrders() {
    const [osList, setOsList] = useState<ServiceOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const { appId } = getInjectedGlobals();
        const collectionPath = `artifacts/${appId}/service_orders`;
        
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
    }, []);

    return { osList, loading, error };
}
