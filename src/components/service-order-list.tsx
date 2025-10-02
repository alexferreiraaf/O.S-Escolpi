"use client";

import type { ServiceOrder } from "@/lib/types";
import { ServiceOrderItem } from "./service-order-item";
import { Skeleton } from "./ui/skeleton";

interface ServiceOrderListProps {
  osList: ServiceOrder[];
  onEdit: (os: ServiceOrder) => void;
  loading: boolean;
}

export default function ServiceOrderList({ osList, onEdit, loading }: ServiceOrderListProps) {

  return (
    <>
      <h2 className="text-3xl font-extrabold text-center mb-6">
        Ordens de Serviço ({osList.length})
      </h2>
      
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-1/4" />
                </div>
                <div className="space-y-2 mt-4">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            </div>
          ))}
        </div>
      ) : osList.length === 0 ? (
        <p className="text-center text-muted-foreground p-8 border-dashed border-2 rounded-lg">
            Nenhuma ordem de serviço encontrada. Crie uma nova!
        </p>
      ) : (
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 -mr-2">
          {osList.map((os) => (
            <ServiceOrderItem key={os.id} os={os} onEdit={onEdit} />
          ))}
        </div>
      )}
    </>
  );
}
