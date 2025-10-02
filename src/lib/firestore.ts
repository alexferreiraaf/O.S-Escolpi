import { db } from '@/lib/firebase';
import type { ServiceOrderFormData, ServiceOrderStatus } from '@/lib/types';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

const COLLECTION_PATH = `service_orders`;

export async function addServiceOrder(data: ServiceOrderFormData) {
    const newOrder = {
        clientName: data.clientName,
        cpfCnpj: data.cpfCnpj || '',
        contact: data.contact || '',
        city: data.city || '',
        state: data.state || '',
        pedidoAgora: data.pedidoAgora,
        mobile: data.mobile,
        ifoodIntegration: data.ifoodIntegration,
        dll: data.dll || '',
        digitalCertificate: data.digitalCertificate || null,
        remoteAccessPhoto: data.remoteAccessPhoto || '',
        remoteAccessCode: data.remoteAccessCode || '',
        createdBy: data.createdBy || '',
        ifoodCredentials: data.ifoodIntegration === 'Sim' ? {
            email: data.ifoodEmail || '',
            password: data.ifoodPassword || ''
        } : null,
        createdAt: serverTimestamp(),
        status: 'Pendente' as ServiceOrderStatus,
    };

    return await addDoc(collection(db, COLLECTION_PATH), newOrder);
}

export async function updateServiceOrder(orderId: string, data: ServiceOrderFormData) {
    const orderUpdate = {
        clientName: data.clientName,
        cpfCnpj: data.cpfCnpj || '',
        contact: data.contact || '',
        city: data.city || '',
        state: data.state || '',
        pedidoAgora: data.pedidoAgora,
        mobile: data.mobile,
        ifoodIntegration: data.ifoodIntegration,
        dll: data.dll || '',
        digitalCertificate: data.digitalCertificate || null,
        remoteAccessPhoto: data.remoteAccessPhoto || '',
        remoteAccessCode: data.remoteAccessCode || '',
        createdBy: data.createdBy || '',
        ifoodCredentials: data.ifoodIntegration === 'Sim' ? {
            email: data.ifoodEmail || '',
            password: data.ifoodPassword || ''
        } : null,
    };
    
    const docRef = doc(db, COLLECTION_PATH, orderId);
    return await updateDoc(docRef, orderUpdate);
}

export async function updateServiceOrderStatus(orderId: string, status: ServiceOrderStatus) {
    const docRef = doc(db, COLLECTION_PATH, orderId);
    return await updateDoc(docRef, { status });
}
