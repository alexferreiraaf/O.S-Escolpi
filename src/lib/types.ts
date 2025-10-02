import type { Timestamp } from 'firebase/firestore';

export type ServiceOrderStatus = 'Pendente' | 'Em Processo' | 'Trello';

export interface DigitalCertificate {
  fileName: string;
  fileContent: string; // Base64 encoded content
}

export interface ServiceOrder {
  id: string;
  clientName: string;
  cpfCnpj: string;
  contact: string;
  city: string;
  state: string;
  pedidoAgora: 'Sim' | 'Não';
  mobile: 'Sim' | 'Não';
  ifoodIntegration: 'Sim' | 'Não';
  ifoodCredentials?: {
    email: string;
    password?: string;
  } | null;
  dll: string;
  digitalCertificate?: DigitalCertificate | null;
  remoteAccessPhoto?: string;
  remoteAccessCode?: string;
  createdAt: Timestamp;
  status: ServiceOrderStatus;
}

export type ServiceOrderFormData = {
  clientName: string;
  cpfCnpj?: string;
  contact?: string;
  city?: string;
  state?: string;
  pedidoAgora: 'Sim' | 'Não';
  mobile: 'Sim' | 'Não';
  ifoodIntegration: 'Sim' | 'Não';
  ifoodEmail?: string;
  ifoodPassword?: string;
  dll?: string;
  digitalCertificate?: DigitalCertificate | null;
  remoteAccessPhoto?: string;
  remoteAccessCode?: string;
};
