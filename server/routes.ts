import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVehicleSchema, insertSettingsSchema, type ExitCalculation } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

// Função auxiliar para calcular se houve pernoite
function hadOvernight(entryTime: Date, exitTime: Date): boolean {
  const entryDay = entryTime.toDateString();
  const exitDay = exitTime.toDateString();
  return entryDay !== exitDay;
}

// Função para calcular o valor da saída
function calculateExit(
  entryTime: Date,
  exitTime: Date,
  vehicleType: "car" | "bike",
  settings: {
    hourlyRateCar: string;
    hourlyRateBike: string;
    overnightFeeCar: string;
    overnightFeeBike: string;
    freeMinutes: number;
  }
): { baseCharge: number; overnightFee: number; totalAmount: number; chargeableMinutes: number } {
  const diffMs = exitTime.getTime() - entryTime.getTime();
  const totalMinutes = Math.floor(diffMs / 60000);

  // Subtrair minutos gratuitos
  const chargeableMinutes = Math.max(0, totalMinutes - settings.freeMinutes);

  // Calcular valor base por hora
  const hourlyRate = vehicleType === "car" 
    ? parseFloat(settings.hourlyRateCar)
    : parseFloat(settings.hourlyRateBike);

  // Converter minutos para horas (arredondando para cima se passou de 1 minuto)
  const chargeableHours = chargeableMinutes > 0 ? Math.ceil(chargeableMinutes / 60) : 0;
  const baseCharge = chargeableHours * hourlyRate;

  // Verificar pernoite
  const overnight = hadOvernight(entryTime, exitTime);
  const overnightFee = overnight
    ? vehicleType === "car"
      ? parseFloat(settings.overnightFeeCar)
      : parseFloat(settings.overnightFeeBike)
    : 0;

  const totalAmount = baseCharge + overnightFee;

  return {
    baseCharge,
    overnightFee,
    totalAmount,
    chargeableMinutes,
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // POST /api/vehicles - Criar entrada de veículo
  app.post("/api/vehicles", async (req, res) => {
    try {
      const parsed = insertVehicleSchema.safeParse(req.body);
      
      if (!parsed.success) {
        const error = fromZodError(parsed.error);
        return res.status(400).json({ 
          message: error.message 
        });
      }

      const vehicle = await storage.createVehicle(parsed.data);
      return res.status(201).json(vehicle);
    } catch (error: any) {
      return res.status(500).json({ 
        message: error.message || "Erro ao criar entrada de veículo" 
      });
    }
  });

  // GET /api/vehicles/active - Listar veículos ativos
  app.get("/api/vehicles/active", async (_req, res) => {
    try {
      const vehicles = await storage.getActiveVehicles();
      return res.json(vehicles);
    } catch (error: any) {
      return res.status(500).json({ 
        message: error.message || "Erro ao buscar veículos ativos" 
      });
    }
  });

  // GET /api/vehicles/:id/calculate - Calcular valor de saída
  app.get("/api/vehicles/:id/calculate", async (req, res) => {
    try {
      const { id } = req.params;
      const vehicle = await storage.getVehicleById(id);

      if (!vehicle) {
        return res.status(404).json({ message: "Veículo não encontrado" });
      }

      if (vehicle.exitTime) {
        return res.status(400).json({ message: "Veículo já teve saída registrada" });
      }

      const settings = await storage.getSettings();
      const exitTime = new Date();
      const entryTime = new Date(vehicle.entryTime);

      const calculation = calculateExit(
        entryTime,
        exitTime,
        vehicle.vehicleType as "car" | "bike",
        settings
      );

      const diffMs = exitTime.getTime() - entryTime.getTime();
      const durationMinutes = Math.floor(diffMs / 60000);

      const result: ExitCalculation = {
        vehicleId: vehicle.id,
        licensePlate: vehicle.licensePlate,
        vehicleType: vehicle.vehicleType as "car" | "bike",
        entryTime: vehicle.entryTime.toISOString(),
        exitTime: exitTime.toISOString(),
        durationMinutes,
        chargeableMinutes: calculation.chargeableMinutes,
        hourlyRate: vehicle.vehicleType === "car" 
          ? parseFloat(settings.hourlyRateCar)
          : parseFloat(settings.hourlyRateBike),
        baseCharge: calculation.baseCharge,
        overnightFee: calculation.overnightFee,
        totalAmount: calculation.totalAmount,
        hadOvernight: hadOvernight(entryTime, exitTime),
      };

      return res.json(result);
    } catch (error: any) {
      return res.status(500).json({ 
        message: error.message || "Erro ao calcular saída" 
      });
    }
  });

  // POST /api/vehicles/:id/exit - Registrar saída de veículo
  app.post("/api/vehicles/:id/exit", async (req, res) => {
    try {
      const { id } = req.params;
      const vehicle = await storage.getVehicleById(id);

      if (!vehicle) {
        return res.status(404).json({ message: "Veículo não encontrado" });
      }

      if (vehicle.exitTime) {
        return res.status(400).json({ message: "Veículo já teve saída registrada" });
      }

      const settings = await storage.getSettings();
      const exitTime = new Date();
      const entryTime = new Date(vehicle.entryTime);

      const calculation = calculateExit(
        entryTime,
        exitTime,
        vehicle.vehicleType as "car" | "bike",
        settings
      );

      const updatedVehicle = await storage.exitVehicle(
        id,
        exitTime,
        calculation.totalAmount.toFixed(2)
      );

      return res.json(updatedVehicle);
    } catch (error: any) {
      return res.status(500).json({ 
        message: error.message || "Erro ao registrar saída" 
      });
    }
  });

  // GET /api/history - Listar histórico de veículos
  app.get("/api/history", async (_req, res) => {
    try {
      const history = await storage.getHistory();
      return res.json(history);
    } catch (error: any) {
      return res.status(500).json({ 
        message: error.message || "Erro ao buscar histórico" 
      });
    }
  });

  // GET /api/settings - Obter configurações
  app.get("/api/settings", async (_req, res) => {
    try {
      const settings = await storage.getSettings();
      return res.json(settings);
    } catch (error: any) {
      return res.status(500).json({ 
        message: error.message || "Erro ao buscar configurações" 
      });
    }
  });

  // PUT /api/settings - Atualizar configurações
  app.put("/api/settings", async (req, res) => {
    try {
      const parsed = insertSettingsSchema.safeParse(req.body);
      
      if (!parsed.success) {
        const error = fromZodError(parsed.error);
        return res.status(400).json({ 
          message: error.message 
        });
      }

      const settings = await storage.updateSettings(parsed.data);
      return res.json(settings);
    } catch (error: any) {
      return res.status(500).json({ 
        message: error.message || "Erro ao atualizar configurações" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
