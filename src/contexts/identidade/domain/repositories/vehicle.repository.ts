import { Vehicle } from '../entities/vehicle';

export interface VehicleRepositoryInterface {
  create: (data: Vehicle) => Promise<Vehicle>;
  find: () => Promise<Vehicle[]>;
  findById: (id: string) => Promise<Vehicle | null>;
  findByPlate: (plate: string) => Promise<Vehicle>;
  updateByPlate: (
    plate: string,
    dataUpdate: Partial<{ model: string; brand: string; year: number }>,
  ) => Promise<Vehicle>;
  remove: (plate: string) => Promise<void>;
}
