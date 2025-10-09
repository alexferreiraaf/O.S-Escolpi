"use client";

import { useState, useEffect } from 'react';
import type { ServiceOrder } from '@/lib/types';
import ServiceOrderForm from '@/components/service-order-form';
import ServiceOrderList from '@/components/service-order-list';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { useServiceOrders } from '@/hooks/use-service-orders';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const FORM_ID = 'service-order-form';

export default function DashboardPage() {
    const [editingOs, setEditingOs] = useState<ServiceOrder | null>(null);
    const { osList, loading } = useServiceOrders();
    const { user, isAuthReady, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isAuthReady && !user) {
            router.push('/');
        }
    }, [user, isAuthReady, router]);

    const handleEdit = (os: ServiceOrder) => {
        setEditingOs(os);
        const formElement = document.getElementById(FORM_ID);
        formElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleFinish = () => {
        setEditingOs(null);
    };

    const handleLogout = async () => {
        await logout();
        router.push('/');
    }

    if (!isAuthReady || !user) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )
    }

    return (
        <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8 transition-colors duration-300">
            <header className="text-center mb-8 md:mb-12 relative max-w-7xl mx-auto">
                <div className="absolute top-0 right-0 flex items-center gap-2">
                    <ThemeToggleButton />
                    <Button variant="ghost" onClick={handleLogout}>Sair</Button>
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
                        existingOrders={osList}
                    />
                </div>
                <div className="flex-1">
                  <Card>
                      <CardContent className="p-4 sm:p-6">
                          <ServiceOrderList 
                            osList={osList} 
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
