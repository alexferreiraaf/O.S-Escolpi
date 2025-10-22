"use client";

import { useMemo } from 'react';
import type { ServiceOrder } from '@/lib/types';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";

export function useServiceOrders() {
    const firestore = useFirestore();

    const collectionRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'service_orders');
    }, [firestore]);

    const q = useMemoFirebase(() => {
        if (!collectionRef) return null;
        return query(collectionRef, orderBy('createdAt', 'desc'));
    }, [collectionRef]);

    const { data: osList, isLoading: loading, error } = useCollection<ServiceOrder>(q);

    return { osList, loading, error: error?.message || null };
}
