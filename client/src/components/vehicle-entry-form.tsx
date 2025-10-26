import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertVehicleSchema, type InsertVehicle } from "@shared/schema";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Car, Bike, Plus } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function VehicleEntryForm() {
  const { toast } = useToast();

  const form = useForm<InsertVehicle>({
    resolver: zodResolver(insertVehicleSchema),
    defaultValues: {
      licensePlate: "",
      vehicleType: "car",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertVehicle) => {
      return await apiRequest("POST", "/api/vehicles", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles/active"] });
      form.reset();
      toast({
        title: "Entrada registrada",
        description: "Veículo adicionado com sucesso ao estacionamento.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao registrar entrada",
        description: error.message || "Ocorreu um erro ao processar a solicitação.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertVehicle) => {
    const upperPlate = data.licensePlate.toUpperCase();
    createMutation.mutate({ ...data, licensePlate: upperPlate });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Registrar Entrada</CardTitle>
        <CardDescription>
          Preencha os dados do veículo para iniciar o controle de permanência
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="licensePlate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Placa do Veículo</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="AAA-0000"
                      className="font-mono text-lg uppercase"
                      maxLength={8}
                      onChange={(e) => {
                        let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
                        if (value.length > 3 && !value.includes("-")) {
                          value = value.slice(0, 3) + "-" + value.slice(3);
                        }
                        field.onChange(value);
                      }}
                      data-testid="input-license-plate"
                    />
                  </FormControl>
                  <FormDescription>
                    Formato: AAA-0000 ou AAA-0A00
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vehicleType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Veículo</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div>
                        <RadioGroupItem
                          value="car"
                          id="car"
                          className="peer sr-only"
                        />
                        <label
                          htmlFor="car"
                          className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-border bg-card p-6 hover-elevate active-elevate-2 cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                          data-testid="radio-car"
                        >
                          <Car className="h-8 w-8 text-foreground" />
                          <span className="text-sm font-medium">Carro</span>
                        </label>
                      </div>
                      <div>
                        <RadioGroupItem
                          value="bike"
                          id="bike"
                          className="peer sr-only"
                        />
                        <label
                          htmlFor="bike"
                          className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-border bg-card p-6 hover-elevate active-elevate-2 cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                          data-testid="radio-bike"
                        >
                          <Bike className="h-8 w-8 text-foreground" />
                          <span className="text-sm font-medium">Moto</span>
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={createMutation.isPending}
              data-testid="button-register-entry"
            >
              {createMutation.isPending ? (
                "Registrando..."
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Registrar Entrada
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
