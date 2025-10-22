
"use client";

import { useRef } from "react";
import type { ServiceOrder, ServiceOrderStatus } from "@/lib/types";
import { Button, buttonVariants } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { CheckCircle2, Cog, Info, Pencil, Download, History, Phone, MapPin, KeyRound, Monitor, FileDown, Trash2 } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { db } from "@/lib/firebase";
import { doc, updateDoc, Timestamp, deleteDoc } from 'firebase/firestore';


function formatDate(timestamp: Timestamp | undefined | null): string {
    if (!timestamp) return 'Sem Data';
    try {
        return timestamp.toDate().toLocaleDateString('pt-BR');
    } catch (e) {
        console.error("Error formatting timestamp:", e);
        return "Data inválida";
    }
}


interface ServiceOrderItemProps {
  os: ServiceOrder;
  onEdit: (os: ServiceOrder) => void;
}

export function ServiceOrderItem({ os, onEdit }: ServiceOrderItemProps) {
  const { toast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);

  const handleStatusUpdate = async (status: ServiceOrderStatus) => {
    try {
      if (!db) {
        toast({ variant: "destructive", title: "Erro", description: "Banco de dados não inicializado." });
        return;
      }
      const docRef = doc(db, 'service_orders', os.id);
      await updateDoc(docRef, { status });
      toast({ title: "Status Atualizado", description: `Ordem de serviço movida para "${status}".` });
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível atualizar o status." });
    }
  };

  const handleDelete = async () => {
    try {
      if (!db) {
        toast({ variant: "destructive", title: "Erro", description: "Banco de dados não inicializado." });
        return;
      }
      const docRef = doc(db, 'service_orders', os.id);
      await deleteDoc(docRef);
      toast({
        title: "Ordem de Serviço Excluída",
        description: `A O.S. de ${os.clientName} foi removida.`,
      });
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Erro ao Excluir",
        description: "Não foi possível remover a ordem de serviço.",
      });
    }
  };

  const handleDownloadCertificate = () => {
    if (!os.digitalCertificate) return;

    const { fileName, fileContent } = os.digitalCertificate;
    try {
      const byteCharacters = atob(fileContent);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/x-pkcs12' });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading certificate:", error);
      toast({
        variant: "destructive",
        title: "Erro no Download",
        description: "Não foi possível decodificar ou baixar o arquivo do certificado.",
      });
    }
  };


  const handleDownloadPdf = () => {
    const input = cardRef.current;
    if (!input) {
      toast({
        variant: "destructive",
        title: "Erro ao gerar PDF",
        description: "Não foi possível encontrar o conteúdo para o PDF.",
      });
      return;
    }
  
    // Hide buttons before taking the screenshot
    const buttons = input.querySelectorAll('button');
    buttons.forEach(btn => btn.style.visibility = 'hidden');
    const statusDiv = input.querySelector<HTMLElement>('.os-status-div');
    if (statusDiv) statusDiv.style.visibility = 'hidden';


    html2canvas(input, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      onclone: (document) => {
        // This is a workaround for images not rendering in html2canvas
        // by re-appending them in the cloned document.
        const image = document.querySelector('img');
        if (image) {
            const newImage = image.cloneNode(true) as HTMLImageElement;
            image.parentNode?.replaceChild(newImage, image);
        }
      }
    }).then((canvas) => {
      // Show buttons again after taking the screenshot
      buttons.forEach(btn => btn.style.visibility = 'visible');
      if (statusDiv) statusDiv.style.visibility = 'visible';

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`OS_${os.clientName.replace(/\s+/g, '_')}_${os.id}.pdf`);
    }).catch(err => {
      // Ensure buttons are visible even if there's an error
      buttons.forEach(btn => btn.style.visibility = 'visible');
      if (statusDiv) statusDiv.style.visibility = 'visible';
      console.error("Could not generate PDF", err);
      toast({
        variant: "destructive",
        title: "Erro ao gerar PDF",
        description: "Ocorreu um problema ao tentar criar o arquivo PDF.",
      });
    });
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
    <div ref={cardRef} className="p-4 bg-card-foreground/5 dark:bg-card-foreground/[.02] border rounded-lg shadow-sm transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-3 border-b pb-3">
        <div>
          <h3 className="text-xl font-bold text-primary">{os.clientName}</h3>
          <p className="text-sm text-muted-foreground">{os.cpfCnpj || 'CPF/CNPJ não informado'}</p>
        </div>
        <div className="text-right">
            <span className="text-xs text-muted-foreground">
              {formatDate(os.createdAt)}
            </span>
            <Button onClick={handleDownloadPdf} variant="ghost" size="icon" title="Baixar como PDF" className="mt-1">
                <FileDown className="w-4 h-4" />
            </Button>
        </div>
      </div>

      <div className="text-sm space-y-2 text-foreground">
        {os.contact && (
          <p className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{os.contact}</span>
          </p>
        )}
        {(os.city || os.state) && (
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {os.city}{os.city && os.state ? ', ' : ''}{os.state}
            </span>
          </p>
        )}
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
            <span className="text-muted-foreground flex items-center gap-2">
              <span className="italic truncate">{os.digitalCertificate.fileName}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDownloadCertificate}
                title={`Baixar ${os.digitalCertificate.fileName}`}
                className="h-7 w-7"
              >
                <Download className="h-4 w-4" />
              </Button>
            </span>
          ) : (
            <span className="text-muted-foreground">N/A</span>
          )}
        </p>

        
        <div className="space-y-2 pt-2 border-t mt-2">
            <h4 className="font-bold text-primary flex items-center gap-2"><Monitor className="h-4 w-4" /> Acesso Remoto</h4>
            {os.remoteAccessCode && (
                 <p className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-muted-foreground">{os.remoteAccessCode}</span>
                </p>
            )}
            {os.remoteAccessPhoto && (
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm">Ver Foto</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>Foto de Acesso Remoto</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                            <Image src={os.remoteAccessPhoto} alt="Acesso Remoto" width={800} height={600} style={{ objectFit: 'contain', width: '100%', height: 'auto' }} className="rounded-md border" />
                        </div>
                    </DialogContent>
                </Dialog>
            )}
            {!os.remoteAccessCode && !os.remoteAccessPhoto && (
                <p className="text-muted-foreground text-xs italic">Nenhuma informação de acesso remoto fornecida.</p>
            )}
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t flex justify-between items-center os-status-div">
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
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" title="Excluir Ordem de Serviço" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso irá excluir permanentemente a ordem de serviço
                    de <span className="font-bold">{os.clientName}</span> dos nossos servidores.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className={cn(buttonVariants({ variant: "destructive" }))}>Continuar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

        </div>
      </div>
    </div>
  );
}
