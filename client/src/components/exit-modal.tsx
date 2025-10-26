import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { type Vehicle, type ExitCalculation } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Car, Bike, Clock, Calendar, DollarSign, Moon } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ExitModalProps {
  vehicle: Vehicle;
  onClose: () => void;
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins} minuto${mins !== 1 ? "s" : ""}`;
  }
  if (mins === 0) {
    return `${hours} hora${hours !== 1 ? "s" : ""}`;
  }
  return `${hours} hora${hours !== 1 ? "s" : ""} e ${mins} minuto${mins !== 1 ? "s" : ""}`;
}

export function ExitModal({ vehicle, onClose }: ExitModalProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(true);

  const { data: calculation, isLoading, error } = useQuery<ExitCalculation>({
    queryKey: [`/api/vehicles/${vehicle.id}/calculate`],
    enabled: isOpen,
  });

  const exitMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/vehicles/${vehicle.id}/exit`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
      toast({
        title: "Saída registrada",
        description: `Veículo ${vehicle.licensePlate} liberado do estacionamento.`,
      });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao registrar saída",
        description: error.message || "Ocorreu um erro ao processar a solicitação.",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  const handleConfirm = () => {
    exitMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-3">
            {vehicle.vehicleType === "car" ? (
              <Car className="h-6 w-6 text-primary" />
            ) : (
              <Bike className="h-6 w-6 text-primary" />
            )}
            Registrar Saída
          </DialogTitle>
          <DialogDescription>
            Confirme os dados do veículo e o valor a ser cobrado
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Clock className="mx-auto h-12 w-12 text-muted-foreground animate-pulse" />
              <p className="mt-4 text-sm text-muted-foreground">Calculando valores...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="rounded-full bg-destructive/10 p-6 mx-auto w-fit">
                <Clock className="h-12 w-12 text-destructive" />
              </div>
              <p className="mt-6 text-sm font-medium text-foreground">
                Erro ao calcular valores
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {error instanceof Error ? error.message : "Ocorreu um erro ao processar a solicitação"}
              </p>
              <Button
                variant="outline"
                onClick={handleClose}
                className="mt-6"
                data-testid="button-close-error"
              >
                Fechar
              </Button>
            </div>
          </div>
        ) : calculation ? (
          <div className="space-y-6">
            <div className="rounded-lg bg-muted/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Placa</span>
                <span className="font-mono font-bold text-lg">{calculation.licensePlate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tipo</span>
                <span className="text-sm font-medium">
                  {calculation.vehicleType === "car" ? "Carro" : "Moto"}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-muted-foreground">Entrada</p>
                  <p className="font-medium">{formatDateTime(calculation.entryTime)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-muted-foreground">Saída</p>
                  <p className="font-medium">{formatDateTime(calculation.exitTime)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-muted-foreground">Permanência</p>
                  <p className="font-medium">{formatDuration(calculation.durationMinutes)}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Detalhamento da Cobrança
              </h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Tempo cobrado ({calculation.chargeableMinutes} min)
                  </span>
                  <span className="font-medium">
                    R$ {calculation.baseCharge.toFixed(2)}
                  </span>
                </div>
                
                {calculation.hadOvernight && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Moon className="h-3 w-3" />
                      Adicional de pernoite
                    </span>
                    <span className="font-medium">
                      R$ {calculation.overnightFee.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex justify-between items-center py-2">
                <span className="text-lg font-semibold">Total a Pagar</span>
                <span className="text-2xl font-bold text-primary">
                  R$ {calculation.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ) : null}

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={exitMutation.isPending}
            data-testid="button-cancel-exit"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={exitMutation.isPending || isLoading || !!error}
            data-testid="button-confirm-exit"
          >
            {exitMutation.isPending ? "Processando..." : "Confirmar Saída"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
