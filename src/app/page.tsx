"use client";

import { useState, useEffect, useRef } from 'react';
import type { ServiceOrder } from '@/lib/types';
import ServiceOrderForm from '@/components/service-order-form';
import ServiceOrderList from '@/components/service-order-list';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { useServiceOrders } from '@/hooks/use-service-orders';
import { Card, CardContent } from '@/components/ui/card';

const FORM_ID = 'service-order-form';

// Ref to track if it's the first time the list is loaded
let isFirstLoad = true;

// A simple in-memory flag to prevent the same device from notifying itself
let justCreatedId: string | null = null;
const clearJustCreatedId = () => {
    if (justCreatedId) {
        setTimeout(() => {
            justCreatedId = null;
        }, 1000);
    }
};

const showNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body });
    }
}

export default function HomePage() {
    const [editingOs, setEditingOs] = useState<ServiceOrder | null>(null);
    const { osList, loading } = useServiceOrders();
    const prevOsListLength = useRef<number>(0);

    useEffect(() => {
        // Pede permissão para notificações quando o componente é montado.
        if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }, []);

    useEffect(() => {
        if (!loading && osList) {
            // After the initial load, start checking for new orders
            if (!isFirstLoad) {
                // Check if a new item was added
                if (osList.length > prevOsListLength.current) {
                    const latestOs = osList[0]; // Assuming list is ordered by creation date desc
                    // If the latest OS was not just created by this device, show notification
                    if (latestOs && latestOs.id !== justCreatedId) {
                       showNotification(
                           "Nova O.S. Recebida!",
                           `Uma nova ordem de serviço foi registrada para: ${latestOs.clientName}`
                       );
                    }
                }
            } else {
                // It's the first load, don't show notifications
                isFirstLoad = false;
            }
             // Update the previous length for the next comparison
            prevOsListLength.current = osList.length;
        }
    }, [osList, loading]);


    const handleEdit = (os: ServiceOrder) => {
        setEditingOs(os);
        const formElement = document.getElementById(FORM_ID);
        formElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleFinish = (newOsId?: string) => {
        setEditingOs(null);
        if (newOsId) {
            justCreatedId = newOsId;
            clearJustCreatedId();
        }
    };

    return (
        <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8 transition-colors duration-300">
            <header className="text-center mb-8 md:mb-12 relative max-w-7xl mx-auto">
                <div className="absolute top-0 right-0 flex items-center gap-2">
                    <ThemeToggleButton />
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-primary leading-tight">
                    Gestão de Ordens de Serviço
                </h1>
                <p className="text-muted-foreground mt-2 text-sm sm:text-base">Escolpi Informática (Powered by Firebase)</p>
            </header>

            <main className="flex flex-col xl:flex-row gap-8 max-w-7xl mx-auto">
                <div className="w-full xl:w-1/3 xl:max-w-md">
                    <ServiceOrderForm
                        id={FORM_ID}
                        key={editingOs?.id ?? 'new'}
                        editingOs={editingOs}
                        onFinish={handleFinish}
                        existingOrders={osList || []}
                    />
                </div>
                <div className="flex-1">
                  <Card>
                      <CardContent className="p-4 sm:p-6">
                          <ServiceOrderList 
                            osList={osList || []} 
                            onEdit={handleEdit} 
                            loading={loading}
                          />
                      </CardContent>
                  </Card>
                </div>
            </main>
        </div>
    );
}
