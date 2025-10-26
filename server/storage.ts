import { type Vehicle, type InsertVehicle, type Settings, type InsertSettings } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Vehicles
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  getActiveVehicles(): Promise<Vehicle[]>;
  getVehicleById(id: string): Promise<Vehicle | undefined>;
  exitVehicle(id: string, exitTime: Date, amountCharged: string): Promise<Vehicle>;
  getHistory(): Promise<Vehicle[]>;

  // Settings
  getSettings(): Promise<Settings>;
  updateSettings(settings: InsertSettings): Promise<Settings>;
}

export class MemStorage implements IStorage {
  private vehicles: Map<string, Vehicle>;
  private settings: Settings;

  constructor() {
    this.vehicles = new Map();
    
    // Initialize default settings
    this.settings = {
      id: randomUUID(),
      hourlyRateCar: "1.00",
      hourlyRateBike: "0.50",
      overnightFeeCar: "10.00",
      overnightFeeBike: "5.00",
      freeMinutes: 15,
    };
  }

  // Vehicle methods
  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const id = randomUUID();
    const vehicle: Vehicle = {
      ...insertVehicle,
      id,
      entryTime: new Date(),
      exitTime: null,
      amountCharged: null,
    };
    this.vehicles.set(id, vehicle);
    return vehicle;
  }

  async getActiveVehicles(): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values())
      .filter((vehicle) => !vehicle.exitTime)
      .sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime());
  }

  async getVehicleById(id: string): Promise<Vehicle | undefined> {
    return this.vehicles.get(id);
  }

  async exitVehicle(id: string, exitTime: Date, amountCharged: string): Promise<Vehicle> {
    const vehicle = this.vehicles.get(id);
    if (!vehicle) {
      throw new Error("Vehicle not found");
    }
    
    const updatedVehicle: Vehicle = {
      ...vehicle,
      exitTime,
      amountCharged,
    };
    
    this.vehicles.set(id, updatedVehicle);
    return updatedVehicle;
  }

  async getHistory(): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values())
      .filter((vehicle) => vehicle.exitTime !== null)
      .sort((a, b) => {
        const timeA = a.exitTime ? new Date(a.exitTime).getTime() : 0;
        const timeB = b.exitTime ? new Date(b.exitTime).getTime() : 0;
        return timeB - timeA;
      });
  }

  // Settings methods
  async getSettings(): Promise<Settings> {
    return this.settings;
  }

  async updateSettings(insertSettings: InsertSettings): Promise<Settings> {
    this.settings = {
      ...this.settings,
      ...insertSettings,
    };
    return this.settings;
  }
}

export const storage = new MemStorage();
