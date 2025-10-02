import { db } from '@/lib/firebase';
import type { ServiceOrderFormData, ServiceOrderStatus } from '@/lib/types';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getInjectedGlobals } from '@/lib/firebase';

const getCollectionPath = (userId: string) => {
    const { appId } = getInjectedGlobals();
    return `artifacts/${appId}/users/${userId}/service_orders`;
}

export async function addServiceOrder(userId: string, data: ServiceOrderFormData) {
    if (!userId) throw new Error('User not authenticated');
    
    const newOrder = {
        clientName: data.clientName,
        pedidoAgora: data.pedidoAgora,
        mobile: data.mobile,
        ifoodIntegration: data.ifoodIntegration,
        dll: data.dll || '',
        digitalCertificate: data.digitalCertificate || '',
        ifoodCredentials: data.ifoodIntegration === 'Sim' ? {
            email: data.ifoodEmail || '',
            password: data.ifoodPassword || ''
        } : null,
        userId: userId,
        createdAt: serverTimestamp(),
        status: 'Pendente' as ServiceOrderStatus,
    };

    const path = getCollectionPath(userId);
    return await addDoc(collection(db, path), newOrder);
}

export async function updateServiceOrder(userId: string, orderId: string, data: ServiceOrderFormData) {
    if (!userId) throw new Error('User not authenticated');

    const orderUpdate = {
        clientName: data.clientName,
        pedidoAgora: data.pedidoAgora,
        mobile: data.mobile,
        ifoodIntegration: data.ifoodIntegration,
        dll: data.dll || '',
        digitalCertificate: data.digitalCertificate || '',
        ifoodCredentials: data.ifoodIntegration === 'Sim' ? {
            email: data.ifoodEmail || '',
            password: data.ifoodPassword || ''
        } : null,
    };
    
    const path = getCollectionPath(userId);
    const docRef = doc(db, path, orderId);
    return await updateDoc(docRef, orderUpdate);
}

export async function updateServiceOrderStatus(userId: string, orderId: string, status: ServiceOrderStatus) {
    if (!userId) throw new Error('User not authenticated');

    const path = getCollectionPath(userId);
    const docRef = doc(db, path, orderId);
    return await updateDoc(docRef, { status });
}
