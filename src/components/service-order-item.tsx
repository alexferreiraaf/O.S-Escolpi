
"use client";

import type { ServiceOrder, ServiceOrderStatus } from "@/lib/types";
import { Button } from "./ui/button";
import { updateServiceOrderStatus } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { CheckCircle2, Cog, Info, Pencil, Download, History } from "lucide-react";

interface ServiceOrderItemProps {
  os: ServiceOrder;
  onEdit: (os: ServiceOrder) => void;
}

export function ServiceOrderItem({ os, onEdit }: ServiceOrderItemProps) {
  const { toast } = useToast();

  const handleStatusUpdate = async (status: ServiceOrderStatus) => {
    try {
      await updateServiceOrderStatus(os.id, status);
      toast({ title: "Status Atualizado", description: `Ordem de serviço movida para "${status}".` });
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível atualizar o status." });
    }
  };
  
  const statusConfig = {
    Pendente: {
      color: "text-muted-foreground",
      icon: <Info className="h-4 w-4 mr-1" />
    },
    'Em Processo': {
      color: "text-yellow-500",
      icon: <Cog className="h-4 w-4 mr-1" />
    },
    Trello: {
      color: "text-green-500",
      icon: <CheckCircle2 className="h-4 w-4 mr-1" />
    },
  };

  return (
    <div className="p-4 bg-card-foreground/5 dark:bg-card-foreground/[.02] border rounded-lg shadow-sm transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-3 border-b pb-3">
        <div>
          <h3 className="text-xl font-bold text-primary">{os.clientName}</h3>
          <p className="text-sm text-muted-foreground">{os.cpfCnpj || 'CPF/CNPJ não informado'}</p>
        </div>
        <span className="text-xs text-muted-foreground">
          {os.createdAt?.toDate ? os.createdAt.toDate().toLocaleDateString('pt-BR') : 'Sem Data'}
        </span>
      </div>

      <div className="text-sm space-y-2 text-foreground">
        <p><strong>Pedido Agora:</strong> <span className={cn(os.pedidoAgora === 'Sim' ? 'text-green-500 font-semibold' : 'text-muted-foreground')}>{os.pedidoAgora}</span></p>
        <p><strong>Mobile:</strong> <span className={cn(os.mobile === 'Sim' ? 'text-accent font-semibold' : 'text-muted-foreground')}>{os.mobile || 'Não'}</span></p>
        <p><strong>Integração Ifood:</strong> <span className={cn(os.ifoodIntegration === 'Sim' ? 'text-destructive font-semibold' : 'text-muted-foreground')}>{os.ifoodIntegration}</span></p>
        
        {os.ifoodIntegration === 'Sim' && os.ifoodCredentials && (
            <div className="pl-4 pt-1 text-destructive/80 border-l-2 border-destructive/50">
                <p className="font-medium">Email: {os.ifoodCredentials.email}</p>
                <p className="font-mono">Senha: {os.ifoodCredentials.password || 'N/A'}</p>
            </div>
        )}

        <p><strong>DLL:</strong> <span className="text-muted-foreground">{os.dll || 'N/A'}</span></p>
        
        <p className="flex items-center gap-2">
            <strong>Certificado:</strong> 
            {os.digitalCertificate ? (
                <Button variant="link" size="sm" className="h-auto p-0 text-accent" onClick={() => alert(`Simulação de download para: ${os.digitalCertificate}`)}>
                    <Download className="h-4 w-4 mr-1" />
                    {os.digitalCertificate}
                </Button>
            ) : (
                <span className="text-muted-foreground">N/A</span>
            )}
        </p>
      </div>
      
      <div className="mt-4 pt-4 border-t flex justify-between items-center">
        <div className="flex items-center font-semibold text-sm">
            Status: 
            <span className={cn('flex items-center ml-2', statusConfig[os.status]?.color || 'text-muted-foreground')}>
                {statusConfig[os.status]?.icon}
                {os.status || 'Pendente'}
            </span>
        </div>

        <div className="flex space-x-1">
          <Button onClick={() => onEdit(os)} variant="ghost" size="icon" title="Editar Ordem de Serviço">
            <Pencil className="w-4 h-4" />
          </Button>

          <Button onClick={() => handleStatusUpdate('Em Processo')} variant="ghost" size="icon" title="Marcar como Em Processo" className={cn(os.status === 'Em Processo' && 'bg-yellow-500/10 text-yellow-500 scale-110')}>
            <Cog className="w-4 h-4" />
          </Button>
          
          <Button onClick={() => handleStatusUpdate('Trello')} variant="ghost" size="icon" title="Marcar como no Trello" className={cn(os.status === 'Trello' && 'bg-green-500/10 text-green-500 scale-110')}>
            <CheckCircle2 className="w-4 h-4" />
          </Button>

          <Button onClick={() => handleStatusUpdate('Pendente')} variant="ghost" size="icon" title="Resetar Status" className={cn(os.status === 'Pendente' && 'bg-muted-foreground/10 text-muted-foreground scale-110')}>
            <History className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

    
