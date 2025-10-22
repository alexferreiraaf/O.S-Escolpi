"use client";

import { useState, useEffect } from 'react';
import type { ServiceOrder } from '@/lib/types';
import { getDb } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, type Firestore } from 'firebase/firestore';

export function useServiceOrders() {
    const [osList, setOsList] = useState<ServiceOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const db = getDb();
        if (!db) {
            // This can happen on server-side render or if initialization fails.
            setLoading(false);
            setError("Banco de dados não está pronto.");
            return;
        }

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
            setError("Falha ao carregar as ordens de serviço.");
            setLoading(false);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    return { osList, loading, error };
}
