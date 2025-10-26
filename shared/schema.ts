import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, decimal, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Veículos estacionados
export const vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  licensePlate: text("license_plate").notNull(),
  vehicleType: text("vehicle_type").notNull(), // 'car' | 'bike'
  entryTime: timestamp("entry_time").notNull(),
  exitTime: timestamp("exit_time"),
  amountCharged: decimal("amount_charged", { precision: 10, scale: 2 }),
});

// Configurações do sistema
export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  hourlyRateCar: decimal("hourly_rate_car", { precision: 10, scale: 2 }).notNull().default("1.00"),
  hourlyRateBike: decimal("hourly_rate_bike", { precision: 10, scale: 2 }).notNull().default("0.50"),
  overnightFeeCar: decimal("overnight_fee_car", { precision: 10, scale: 2 }).notNull().default("10.00"),
  overnightFeeBike: decimal("overnight_fee_bike", { precision: 10, scale: 2 }).notNull().default("5.00"),
  freeMinutes: integer("free_minutes").notNull().default(15),
});

// Vehicle schemas
export const insertVehicleSchema = createInsertSchema(vehicles, {
  licensePlate: z.string()
    .min(1, "Placa é obrigatória")
    .regex(/^[A-Z]{3}-\d[A-Z0-9]\d{2}$/, "Placa deve estar no formato AAA-0000 ou AAA-0A00"),
  vehicleType: z.enum(["car", "bike"], { 
    required_error: "Tipo de veículo é obrigatório" 
  }),
}).omit({
  id: true,
  exitTime: true,
  amountCharged: true,
});

export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehicles.$inferSelect;

// Settings schemas
export const insertSettingsSchema = createInsertSchema(settings, {
  hourlyRateCar: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: "Tarifa deve ser um valor válido",
  }),
  hourlyRateBike: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: "Tarifa deve ser um valor válido",
  }),
  overnightFeeCar: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: "Taxa deve ser um valor válido",
  }),
  overnightFeeBike: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: "Taxa deve ser um valor válido",
  }),
  freeMinutes: z.number().int().min(0, "Minutos devem ser 0 ou maior"),
}).omit({ id: true });

export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;

// Tipo para cálculo de saída
export type ExitCalculation = {
  vehicleId: string;
  licensePlate: string;
  vehicleType: "car" | "bike";
  entryTime: string;
  exitTime: string;
  durationMinutes: number;
  chargeableMinutes: number;
  hourlyRate: number;
  baseCharge: number;
  overnightFee: number;
  totalAmount: number;
  hadOvernight: boolean;
};
