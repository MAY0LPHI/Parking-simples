import { useQuery } from "@tanstack/react-query";
import { type Vehicle } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, Car, Bike, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { ExitModal } from "./exit-modal";

function formatDuration(entryTime: string): string {
  const entry = new Date(entryTime);
  const now = new Date();
  const diffMs = now.getTime() - entry.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  const hours = Math.floor(diffMins / 60);
  const minutes = diffMins % 60;
  
  if (hours === 0) {
    return `${minutes}min`;
  }
  return `${hours}h ${minutes}min`;
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("pt-BR", { 
    hour: "2-digit", 
    minute: "2-digit" 
  });
}

export function ActiveVehiclesTable() {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [, setTick] = useState(0);

  const { data: vehicles = [], isLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles/active"],
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Veículos no Estacionamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Clock className="mx-auto h-12 w-12 text-muted-foreground animate-pulse" />
              <p className="mt-4 text-sm text-muted-foreground">Carregando...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl">Veículos no Estacionamento</CardTitle>
            <CardDescription>
              {vehicles.length === 0
                ? "Nenhum veículo estacionado no momento"
                : `${vehicles.length} ${vehicles.length === 1 ? "veículo estacionado" : "veículos estacionados"}`}
            </CardDescription>
          </div>
          {vehicles.length > 0 && (
            <Badge variant="secondary" className="text-base px-4 py-2">
              {vehicles.length}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {vehicles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-muted p-6">
                <Car className="h-12 w-12 text-muted-foreground" />
              </div>
              <p className="mt-6 text-sm font-medium text-foreground">
                Nenhum veículo estacionado
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Registre uma entrada para começar
              </p>
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">Placa</TableHead>
                    <TableHead className="w-[100px]">Tipo</TableHead>
                    <TableHead className="w-[120px]">Entrada</TableHead>
                    <TableHead>Tempo Decorrido</TableHead>
                    <TableHead className="w-[140px] text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map((vehicle) => (
                    <TableRow key={vehicle.id} data-testid={`row-vehicle-${vehicle.id}`}>
                      <TableCell className="font-mono font-semibold">
                        {vehicle.licensePlate}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {vehicle.vehicleType === "car" ? (
                            <>
                              <Car className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">Carro</span>
                            </>
                          ) : (
                            <>
                              <Bike className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">Moto</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatTime(vehicle.entryTime)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          <Clock className="mr-1 h-3 w-3" />
                          {formatDuration(vehicle.entryTime)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedVehicle(vehicle)}
                          data-testid={`button-exit-${vehicle.id}`}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Registrar Saída
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedVehicle && (
        <ExitModal
          vehicle={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
        />
      )}
    </>
  );
}
