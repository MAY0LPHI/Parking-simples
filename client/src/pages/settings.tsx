import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSettingsSchema, type InsertSettings, type Settings } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { DollarSign, Clock, Moon, Save, Settings as SettingsIcon } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery<Settings>({
    queryKey: ["/api/settings"],
  });

  const form = useForm<InsertSettings>({
    resolver: zodResolver(insertSettingsSchema),
    values: settings ? {
      hourlyRateCar: settings.hourlyRateCar,
      hourlyRateBike: settings.hourlyRateBike,
      overnightFeeCar: settings.overnightFeeCar,
      overnightFeeBike: settings.overnightFeeBike,
      freeMinutes: settings.freeMinutes,
    } : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertSettings) => {
      return await apiRequest("PUT", "/api/settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Configurações salvas",
        description: "As novas tarifas foram aplicadas com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao salvar configurações",
        description: error.message || "Ocorreu um erro ao processar a solicitação.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertSettings) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground mt-1">
            Carregando configurações...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <SettingsIcon className="h-8 w-8" />
          Configurações
        </h1>
        <p className="text-muted-foreground mt-1">
          Ajuste as tarifas e períodos de cobrança do estacionamento
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Tarifas por Hora
              </CardTitle>
              <CardDescription>
                Defina o valor cobrado por hora de permanência para cada tipo de veículo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="hourlyRateCar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tarifa por Hora - Carro</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          R$
                        </span>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          min="0"
                          className="pl-10"
                          data-testid="input-hourly-rate-car"
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Valor cobrado por hora para carros
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hourlyRateBike"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tarifa por Hora - Moto</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          R$
                        </span>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          min="0"
                          className="pl-10"
                          data-testid="input-hourly-rate-bike"
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Valor cobrado por hora para motos
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Moon className="h-5 w-5" />
                Adicional de Pernoite
              </CardTitle>
              <CardDescription>
                Taxa adicional cobrada quando o veículo permanece durante a noite
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="overnightFeeCar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adicional de Pernoite - Carro</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          R$
                        </span>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          min="0"
                          className="pl-10"
                          data-testid="input-overnight-fee-car"
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Valor adicional cobrado para carros que pernoitam
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="overnightFeeBike"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adicional de Pernoite - Moto</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          R$
                        </span>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          min="0"
                          className="pl-10"
                          data-testid="input-overnight-fee-bike"
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Valor adicional cobrado para motos que pernoitam
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Tempo Gratuito
              </CardTitle>
              <CardDescription>
                Período inicial sem cobrança para todos os veículos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="freeMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minutos Gratuitos</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="input-free-minutes"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                          minutos
                        </span>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Tempo de cortesia antes de iniciar a cobrança
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Separator />

          <div className="flex justify-end">
            <Button
              type="submit"
              size="lg"
              disabled={updateMutation.isPending}
              data-testid="button-save-settings"
            >
              {updateMutation.isPending ? (
                "Salvando..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Configurações
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
