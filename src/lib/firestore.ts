import { db } from '@/lib/firebase';
import type { ServiceOrderFormData, ServiceOrderStatus } from '@/lib/types';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getInjectedGlobals } from '@/lib/firebase';

const getCollectionPath = () => {
    const { appId } = getInjectedGlobals();
    // Using a public path that doesn't depend on a user
    return `artifacts/${appId}/service_orders`;
}

export async function addServiceOrder(data: ServiceOrderFormData) {
    const newOrder = {
        clientName: data.clientName,
        cpfCnpj: data.cpfCnpj || '',
        contact: data.contact || '',
        pedidoAgora: data.pedidoAgora,
        mobile: data.mobile,
        ifoodIntegration: data.ifoodIntegration,
        dll: data.dll || '',
        digitalCertificate: data.digitalCertificate || '',
        ifoodCredentials: data.ifoodIntegration === 'Sim' ? {
            email: data.ifoodEmail || '',
            password: data.ifoodPassword || ''
        } : null,
        createdAt: serverTimestamp(),
        status: 'Pendente' as ServiceOrderStatus,
    };

    const path = getCollectionPath();
    return await addDoc(collection(db, path), newOrder);
}

export async function updateServiceOrder(orderId: string, data: ServiceOrderFormData) {
    const orderUpdate = {
        clientName: data.clientName,
        cpfCnpj: data.cpfCnpj || '',
        contact: data.contact || '',
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
    
    const path = getCollectionPath();
    const docRef = doc(db, path, orderId);
    return await updateDoc(docRef, orderUpdate);
}

export async function updateServiceOrderStatus(orderId: string, status: ServiceOrderStatus) {
    const path = getCollectionPath();
    const docRef = doc(db, path, orderId);
    return await updateDoc(docRef, { status });
}
