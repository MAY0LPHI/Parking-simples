import { VehicleEntryForm } from "@/components/vehicle-entry-form";
import { ActiveVehiclesTable } from "@/components/active-vehicles-table";
import { HistorySection } from "@/components/history-section";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Painel Principal</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie as entradas e saídas do estacionamento
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <VehicleEntryForm />
        </div>
        <div className="md:col-span-2">
          <ActiveVehiclesTable />
        </div>
      </div>

      <HistorySection />
    </div>
  );
}
