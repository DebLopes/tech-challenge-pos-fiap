import type { VehicleSnapshot } from './vehicle-lookup.port';

export type ProvisionVehicleInput = {
  plate: string;
  brand: string;
  model: string;
  year: number;
};

export interface VehicleProvisioningPort {
  getOrCreate(input: ProvisionVehicleInput): Promise<VehicleSnapshot>;
}

export const VEHICLE_PROVISIONING = Symbol('VEHICLE_PROVISIONING');
