"use client";

import { useEffect } from 'react';
import { errorEmitter, FirestorePermissionError } from '@/lib/errors';
import { useToast } from '@/hooks/use-toast';
import { Badge } from './ui/badge';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      console.error("Caught Firestore Permission Error:", error);
      
      toast({
        variant: 'destructive',
        duration: 20000, 
        title: "Erro de Permissão do Firestore",
        description: (
          <div className="mt-2 space-y-4 text-sm">
            <p>A operação foi bloqueada pelas regras de segurança do banco de dados.</p>
            
            <div className="space-y-1">
              <h4 className="font-semibold">Detalhes do Erro:</h4>
              <Alert variant="destructive" className="bg-destructive/10">
                <AlertDescription className="break-words">
                  <div className="flex items-center gap-2 mb-2">
                    <strong>Operação:</strong> 
                    <Badge variant="destructive" className="font-mono">{error.operation}</Badge>
                  </div>
                  <p><strong>Coleção:</strong> <code className="font-mono">{error.ref.path}</code></p>
                </AlertDescription>
              </Alert>
            </div>
            
            {error.resource && Object.keys(error.resource).length > 0 && (
               <div className="space-y-2">
                <h4 className="font-semibold">Dados da Requisição:</h4>
                <div className="p-2 border border-destructive/50 rounded-md bg-destructive/10 max-h-48 overflow-auto">
                    <pre className="text-xs text-destructive-foreground/80 whitespace-pre-wrap break-all">
                        <code>{JSON.stringify(error.resource, null, 2)}</code>
                    </pre>
                </div>
              </div>
            )}
            
            <p className="pt-2 text-destructive-foreground/70">
              Para corrigir, atualize as Regras de Segurança do Firestore no seu Console do Firebase para permitir esta operação.
            </p>
          </div>
        ),
      });
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null;
}
