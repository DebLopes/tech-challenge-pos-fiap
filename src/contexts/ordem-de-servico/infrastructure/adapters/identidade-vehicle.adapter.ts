import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundError } from '../../../shared/domain/errors';
import { Vehicle } from '../../../identidade/domain/entities/vehicle';
import type { VehicleRepositoryInterface } from '../../../identidade/domain/repositories/vehicle.repository';
import { VEHICLE_REPOSITORY } from '../../../identidade/domain/repositories/tokens';
import { CreateVehicleUseCase } from '../../../identidade/application/use-case/vehicle/create-vehicle';
import type {
  VehicleLookupPort,
  VehicleSnapshot,
} from '../../domain/services/vehicle-lookup.port';
import type {
  VehicleProvisioningPort,
  ProvisionVehicleInput,
} from '../../domain/services/vehicle-provisioning.port';

@Injectable()
export class IdentidadeVehicleAdapter
  implements VehicleLookupPort, VehicleProvisioningPort
{
  constructor(
    @Inject(VEHICLE_REPOSITORY)
    private readonly vehicleRepo: VehicleRepositoryInterface,
    private readonly createVehicle: CreateVehicleUseCase,
  ) {}

  async findById(id: string): Promise<VehicleSnapshot | null> {
    const vehicle = await this.vehicleRepo.findById(id);
    return vehicle ? this.toSnapshot(vehicle) : null;
  }

  async getOrCreate(input: ProvisionVehicleInput): Promise<VehicleSnapshot> {
    try {
      const existing = await this.vehicleRepo.findByPlate(input.plate);
      return this.toSnapshot(existing);
    } catch (error) {
      if (!(error instanceof EntityNotFoundError)) {
        throw error;
      }
      const created = await this.createVehicle.execute(input);
      return this.toSnapshot(created);
    }
  }

  private toSnapshot(vehicle: Vehicle): VehicleSnapshot {
    return {
      id: vehicle.id,
      plate: vehicle.plate,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
    };
  }
}
