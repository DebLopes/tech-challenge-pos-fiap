import { Inject, Injectable } from '@nestjs/common';
import { Vehicle } from '../../../domain/entities/vehicle';
import type { VehicleRepositoryInterface } from '../../../domain/repositories/vehicle.repository';
import { VEHICLE_REPOSITORY } from '../../../domain/repositories/tokens';
import type { UpdateVehicleInput } from './vehicle.inputs';

@Injectable()
export class UpdatedVehicleUseCase {
  constructor(
    @Inject(VEHICLE_REPOSITORY)
    private readonly vehicleRepo: VehicleRepositoryInterface,
  ) {}

  async execute(plate: string, input: UpdateVehicleInput): Promise<Vehicle> {
    return this.vehicleRepo.updateByPlate(plate, input);
  }
}
