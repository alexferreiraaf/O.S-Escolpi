"use client";

import { useState, useEffect } from 'react';
import type { ServiceOrder } from '@/lib/types';
import { getDb } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, type Firestore, type CollectionReference } from 'firebase/firestore';
import { errorEmitter, FirestorePermissionError } from '@/lib/errors';


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
        const ordersCollection = collection(db, collectionPath) as CollectionReference;
        
        const q = query(
            ordersCollection,
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceOrder));
            setOsList(orders);
            setLoading(false);
        }, (err: any) => {
             if (err.code === 'permission-denied') {
                errorEmitter.emit('permission-error', new FirestorePermissionError(
                    'listen',
                    ordersCollection
                ));
            } else {
                console.error("Error fetching service orders:", err);
                setError("Falha ao carregar as ordens de serviço.");
            }
            setLoading(false);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    return { osList, loading, error };
}
