export type VehicleSnapshot = {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
};

export interface VehicleLookupPort {
  findById(id: string): Promise<VehicleSnapshot | null>;
}

export const VEHICLE_LOOKUP = Symbol('VEHICLE_LOOKUP');
