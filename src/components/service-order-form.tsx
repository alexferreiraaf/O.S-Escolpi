"use client";

import * as React from "react";
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
} from "@/components/ui";
import type { ServiceOrder, ServiceOrderFormData, DigitalCertificate } from "@/lib/types";
import { addServiceOrder, updateServiceOrder } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2 } from "lucide-react";
import { suggestDllName } from '@/ai/flows/suggest-dll-name';
import { CameraCapture } from "./camera-capture";

const formSchema = z.object({
    clientName: z.string().min(1, 'O nome do cliente é obrigatório.'),
    cpfCnpj: z.string().optional(),
    contact: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pedidoAgora: z.enum(['Sim', 'Não']),
    mobile: z.enum(['Sim', 'Não']),
    ifoodIntegration: z.enum(['Sim', 'Não']),
    ifoodEmail: z.string().email({ message: "Email inválido." }).optional().or(z.literal('')),
    ifoodPassword: z.string().optional(),
    dll: z.string().optional(),
    digitalCertificate: z.custom<DigitalCertificate>().optional().nullable(),
    remoteAccessPhoto: z.string().optional(),
    remoteAccessCode: z.string().optional(),
    createdBy: z.string().optional(),
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
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const form = useForm<ServiceOrderFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      cpfCnpj: "",
      contact: "",
      city: "",
      state: "",
      pedidoAgora: "Não",
      mobile: "Não",
      ifoodIntegration: "Não",
      ifoodEmail: "",
      ifoodPassword: "",
      dll: "",
      digitalCertificate: null,
      remoteAccessPhoto: "",
      remoteAccessCode: "",
      createdBy: "",
    },
  });
  
  const ifoodIntegrationValue = form.watch("ifoodIntegration");
  const digitalCertificateValue = form.watch("digitalCertificate");

  useEffect(() => {
    if (editingOs) {
      form.reset({
        clientName: editingOs.clientName,
        cpfCnpj: editingOs.cpfCnpj || '',
        contact: editingOs.contact || '',
        city: editingOs.city || '',
        state: editingOs.state || '',
        pedidoAgora: editingOs.pedidoAgora,
        mobile: editingOs.mobile,
        ifoodIntegration: editingOs.ifoodIntegration,
        ifoodEmail: editingOs.ifoodCredentials?.email || '',
        ifoodPassword: editingOs.ifoodCredentials?.password || '',
        dll: editingOs.dll,
        digitalCertificate: editingOs.digitalCertificate || null,
        remoteAccessPhoto: editingOs.remoteAccessPhoto || '',
        remoteAccessCode: editingOs.remoteAccessCode || '',
        createdBy: editingOs.createdBy || '',
      });
    } else {
        form.reset({
          clientName: "",
          cpfCnpj: "",
          contact: "",
          city: "",
          state: "",
          pedidoAgora: "Não",
          mobile: "Não",
          ifoodIntegration: "Não",
          ifoodEmail: "",
          ifoodPassword: "",
          dll: "",
          digitalCertificate: null,
          remoteAccessPhoto: "",
          remoteAccessCode: "",
          createdBy: "",
        });
    }
  }, [editingOs, form]);

  const generateDllSuggestion = async () => {
    const clientName = form.getValues('clientName');
    if (!clientName) return;

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
  };

  const handleCertificateFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = (e.target?.result as string).split(',')[1]; // Get Base64 content
        if (fileContent) {
          form.setValue('digitalCertificate', {
            fileName: file.name,
            fileContent: fileContent,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const removeCertificate = () => {
    form.setValue('digitalCertificate', null);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }


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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Ex: São Paulo"
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Ex: SP"
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
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

             <FormField
                control={form.control}
                name="remoteAccessPhoto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Foto para Acesso Remoto</FormLabel>
                    <FormControl>
                       <CameraCapture value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            
            <FormField
              control={form.control}
              name="remoteAccessCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código AnyDesk/TeamViewer</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ex: 123 456 789"
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField control={form.control} name="digitalCertificate" render={({ field }) => (
              <FormItem>
                  <FormLabel>Certificado Digital (Arquivo .pfx)</FormLabel>
                  {digitalCertificateValue ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-2 rounded-md">
                        <span className="flex-1 truncate italic">{digitalCertificateValue.fileName}</span>
                        <Button type="button" variant="ghost" size="icon" onClick={removeCertificate} className="h-6 w-6">
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                  ) : (
                    <FormControl>
                        <Input 
                            id="digitalCertificateFile" 
                            type="file" 
                            accept=".pfx"
                            ref={fileInputRef}
                            onChange={handleCertificateFileChange}
                            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        />
                    </FormControl>
                  )}
              </FormItem>
            )}/>

            <FormField
              control={form.control}
              name="createdBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>O.S feita por:</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ex: João da Silva"
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-2 mt-8">
                <Button type="button" variant="ghost" onClick={() => {form.reset(); onFinish();}}>Cancelar</Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : (editingOs ? 'Salvar Alterações' : 'Criar OS')}
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
