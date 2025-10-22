"use client";

import { useState, useEffect } from 'react';
import type { ServiceOrder } from '@/lib/types';
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

export function useServiceOrders() {
    const [osList, setOsList] = useState<ServiceOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!db) {
            setError("Banco de dados não inicializado.");
            setLoading(false);
            return;
        }

        let unsubscribe: () => void;

        try {
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
    }, []);

    return { osList, loading, error };
}
