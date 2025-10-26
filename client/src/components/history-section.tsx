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
import { Badge } from "@/components/ui/badge";
import { Car, Bike, Clock, History as HistoryIcon } from "lucide-react";

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(entryTime: string, exitTime: string): string {
  const entry = new Date(entryTime);
  const exit = new Date(exitTime);
  const diffMs = exit.getTime() - entry.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  const hours = Math.floor(diffMins / 60);
  const minutes = diffMins % 60;
  
  if (hours === 0) {
    return `${minutes}min`;
  }
  return `${hours}h ${minutes}min`;
}

export function HistorySection() {
  const { data: history = [], isLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/history"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Histórico de Movimentações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Clock className="mx-auto h-12 w-12 text-muted-foreground animate-pulse" />
              <p className="mt-4 text-sm text-muted-foreground">Carregando histórico...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <HistoryIcon className="h-5 w-5" />
          Histórico de Movimentações
        </CardTitle>
        <CardDescription>
          {history.length === 0
            ? "Nenhum registro no histórico"
            : `${history.length} ${history.length === 1 ? "registro" : "registros"} no histórico`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-6">
              <HistoryIcon className="h-12 w-12 text-muted-foreground" />
            </div>
            <p className="mt-6 text-sm font-medium text-foreground">
              Nenhum registro no histórico
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              As saídas aparecerão aqui
            </p>
          </div>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Placa</TableHead>
                  <TableHead className="w-[100px]">Tipo</TableHead>
                  <TableHead>Entrada</TableHead>
                  <TableHead>Saída</TableHead>
                  <TableHead className="w-[120px]">Permanência</TableHead>
                  <TableHead className="w-[120px] text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((vehicle) => (
                  <TableRow key={vehicle.id} data-testid={`row-history-${vehicle.id}`}>
                    <TableCell className="font-mono font-semibold">
                      {vehicle.licensePlate}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {vehicle.vehicleType === "car" ? (
                          <Car className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Bike className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDateTime(vehicle.entryTime)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {vehicle.exitTime ? formatDateTime(vehicle.exitTime) : "-"}
                    </TableCell>
                    <TableCell>
                      {vehicle.exitTime && (
                        <Badge variant="outline" className="font-mono">
                          {formatDuration(vehicle.entryTime, vehicle.exitTime)}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-primary">
                      {vehicle.amountCharged
                        ? `R$ ${parseFloat(vehicle.amountCharged).toFixed(2)}`
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
