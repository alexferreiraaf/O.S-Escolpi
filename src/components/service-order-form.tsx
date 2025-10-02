
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  RadioGroup,
  RadioGroupItem,
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui";
import type { ServiceOrder, ServiceOrderFormData } from "@/lib/types";
import { addServiceOrder, updateServiceOrder } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { suggestDllName } from '@/ai/flows/suggest-dll-name';

const formSchema = z.object({
    clientName: z.string().min(1, 'O nome do cliente é obrigatório.'),
    cpfCnpj: z.string().optional(),
    contact: z.string().optional(),
    pedidoAgora: z.enum(['Sim', 'Não']),
    mobile: z.enum(['Sim', 'Não']),
    ifoodIntegration: z.enum(['Sim', 'Não']),
    ifoodEmail: z.string().email({ message: "Email inválido." }).optional().or(z.literal('')),
    ifoodPassword: z.string().optional(),
    dll: z.string().optional(),
    digitalCertificate: z.any().optional(),
}).refine(data => {
    if (data.ifoodIntegration === 'Sim') {
        return !!data.ifoodEmail && data.ifoodEmail.length > 0;
    }
    return true;
}, {
    message: 'Email do iFood é obrigatório para integração.',
    path: ['ifoodEmail'],
});

interface ServiceOrderFormProps {
  editingOs: ServiceOrder | null;
  onFinish: () => void;
  existingOrders: ServiceOrder[];
}

export default function ServiceOrderForm({ editingOs, onFinish }: ServiceOrderFormProps) {
  const { toast } = useToast();
  const [isSuggestingDll, setIsSuggestingDll] = useState(false);
  
  const form = useForm<ServiceOrderFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      cpfCnpj: "",
      contact: "",
      pedidoAgora: "Não",
      mobile: "Não",
      ifoodIntegration: "Não",
      ifoodEmail: "",
      ifoodPassword: "",
      dll: "",
      digitalCertificate: "",
    },
  });
  
  const ifoodIntegrationValue = form.watch("ifoodIntegration");

  useEffect(() => {
    if (editingOs) {
      form.reset({
        clientName: editingOs.clientName,
        cpfCnpj: editingOs.cpfCnpj || '',
        contact: editingOs.contact || '',
        pedidoAgora: editingOs.pedidoAgora,
        mobile: editingOs.mobile,
        ifoodIntegration: editingOs.ifoodIntegration,
        ifoodEmail: editingOs.ifoodCredentials?.email || '',
        ifoodPassword: editingOs.ifoodCredentials?.password || '',
        dll: editingOs.dll,
        digitalCertificate: editingOs.digitalCertificate,
      });
    } else {
        form.reset({
          clientName: "",
          cpfCnpj: "",
          contact: "",
          pedidoAgora: "Não",
          mobile: "Não",
          ifoodIntegration: "Não",
          ifoodEmail: "",
          ifoodPassword: "",
          dll: "",
          digitalCertificate: "",
        });
    }
  }, [editingOs, form]);

  const generateDllSuggestion = async () => {
    const clientName = form.getValues('clientName');
    if (clientName) {
        setIsSuggestingDll(true);
        try {
            const result = await suggestDllName({ clientName });
            if (result.suggestedDllName) {
                form.setValue('dll', result.suggestedDllName);
                toast({ title: "Sugestão de DLL gerada!", description: `A DLL sugerida foi: ${result.suggestedDllName}` });
            }
        } catch (e) {
            console.error("DLL suggestion failed:", e);
            toast({ variant: 'destructive', title: "Erro na IA", description: "Não foi possível gerar sugestão de DLL." });
        } finally {
            setIsSuggestingDll(false);
        }
    }
  };


  const onSubmit = async (values: ServiceOrderFormData) => {
    try {
      if (editingOs) {
        await updateServiceOrder(editingOs.id, values);
        toast({ title: "Sucesso!", description: "Ordem de Serviço atualizada." });
      } else {
        await addServiceOrder(values);
        toast({ title: "Sucesso!", description: "Ordem de Serviço criada." });
      }
      form.reset();
      onFinish();
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Erro", description: "Falha ao salvar a Ordem de Serviço." });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl sm:text-3xl font-extrabold text-center">
          {editingOs ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Cliente <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ex: Pastelaria do Zé"
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cpfCnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF/CNPJ</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="00.000.000/0000-00"
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contato do Cliente</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="(99) 99999-9999"
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
               <FormField control={form.control} name="pedidoAgora" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pedido Agora</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4">
                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Sim" /></FormControl><FormLabel className="font-normal">Sim</FormLabel></FormItem>
                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Não" /></FormControl><FormLabel className="font-normal">Não</FormLabel></FormItem>
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}/>
                <FormField control={form.control} name="mobile" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4">
                          <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Sim" /></FormControl><FormLabel className="font-normal">Sim</FormLabel></FormItem>
                          <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Não" /></FormControl><FormLabel className="font-normal">Não</FormLabel></FormItem>
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}/>
            </div>

            <FormField control={form.control} name="ifoodIntegration" render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Integração com Ifood?</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4">
                      <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Sim" /></FormControl><FormLabel className="font-normal">Sim</FormLabel></FormItem>
                      <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Não" /></FormControl><FormLabel className="font-normal">Não</FormLabel></FormItem>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}/>

            {ifoodIntegrationValue === "Sim" && (
              <div className="space-y-4 p-4 border border-destructive/50 bg-destructive/10 rounded-lg shadow-inner">
                <p className="text-sm font-bold text-destructive">Credenciais iFood</p>
                <FormField control={form.control} name="ifoodEmail" render={({ field }) => (
                    <FormItem><FormLabel>Email do Portal iFood</FormLabel><FormControl><Input {...field} placeholder="email@ifood.com.br" type="email" /></FormControl><FormMessage /></FormItem>
                  )}/>
                <FormField control={form.control} name="ifoodPassword" render={({ field }) => (
                    <FormItem><FormLabel>Senha do Portal iFood</FormLabel><FormControl><Input {...field} placeholder="••••••••" type="text" /></FormControl><FormMessage /></FormItem>
                  )}/>
              </div>
            )}
            
            <FormField control={form.control} name="dll" render={({ field }) => (
                <FormItem>
                  <FormLabel>DLL</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl><Input {...field} placeholder="Ex: NFePlus.dll" /></FormControl>
                    <Button type="button" variant="outline" onClick={generateDllSuggestion} disabled={isSuggestingDll || !form.getValues('clientName')}>
                        {isSuggestingDll ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sugerir'}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}/>

            <FormField control={form.control} name="digitalCertificate" render={({ field: { onChange, value, ...rest } }) => (
              <FormItem>
                  <FormLabel>Certificado Digital (Arquivo .pfx)</FormLabel>
                  <FormControl>
                      <Input 
                          {...rest}
                          id="digitalCertificateFile" 
                          type="file" 
                          accept=".pfx"
                          onChange={(e) => onChange(e.target.files?.[0]?.name || '')}
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                      />
                  </FormControl>
                  {value && <p className="text-sm text-muted-foreground italic mt-2">Arquivo: {value}</p>}
                  <Alert variant="default" className="mt-2">
                      <AlertTitle className="text-sm font-bold text-destructive">Atenção</AlertTitle>
                      <AlertDescription className="text-xs">
                          O arquivo é selecionado, mas apenas o nome do arquivo é armazenado.
                      </AlertDescription>
                  </Alert>
                  <FormMessage />
              </FormItem>
            )}/>

            <div className="flex flex-col sm:flex-row gap-2">
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {editingOs ? "Atualizar Ordem" : "Salvar Ordem"}
                </Button>
                {editingOs && <Button type="button" variant="outline" className="w-full" onClick={() => onFinish()}>Cancelar Edição</Button>}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
