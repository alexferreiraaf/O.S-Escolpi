"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Camera, Upload, Trash2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from './ui/dialog';
import Image from 'next/image';

interface CameraCaptureProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}

export function CameraCapture({ value, onChange }: CameraCaptureProps) {
  const { toast } = useToast();
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isCameraSupported, setIsCameraSupported] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // This code runs only on the client, after the component has mounted.
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setIsCameraSupported(true);
    } else {
      setIsCameraSupported(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = async () => {
    if (!isCameraSupported) {
      toast({
        variant: 'destructive',
        title: 'Câmera não suportada',
        description: 'Seu navegador não suporta acesso à câmera.',
      });
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasPermission(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        variant: 'destructive',
        title: 'Câmera não autorizada',
        description:
          'Por favor, permita o acesso à câmera nas configurações do seu navegador.',
      });
      setHasPermission(false);
      setIsCameraOpen(false);
    }
  };

  const handleTakePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        onChange(dataUrl);
      }
      setIsCameraOpen(false);
      stopCamera();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onChange(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDialogClose = () => {
    stopCamera();
    setIsCameraOpen(false);
  }

  return (
    <div className="space-y-2">
      {value && (
        <div className="relative group w-full aspect-video rounded-md overflow-hidden border">
          <Image src={value} alt="Acesso Remoto" layout="fill" objectFit="contain" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => onChange(undefined)}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                setIsCameraOpen(true);
                startCamera();
              }}
              disabled={!isCameraSupported}
            >
              <Camera className="mr-2 h-4 w-4" />
              Tirar Foto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg" onPointerDownOutside={handleDialogClose} onEscapeKeyDown={handleDialogClose}>
            <DialogHeader>
              <DialogTitle>Capturar Foto</DialogTitle>
              <DialogClose asChild>
                 <button onClick={handleDialogClose} className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    <XCircle className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                 </button>
              </DialogClose>
            </DialogHeader>
            <div className="mt-4">
              {hasPermission === false ? (
                <p className="text-destructive text-center">
                  Acesso à câmera negado.
                </p>
              ) : (
                <>
                  <video ref={videoRef} autoPlay playsInline className="w-full h-auto rounded-md" />
                  <Button type="button" onClick={handleTakePhoto} className="w-full mt-4">
                    Capturar
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          Anexar
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}