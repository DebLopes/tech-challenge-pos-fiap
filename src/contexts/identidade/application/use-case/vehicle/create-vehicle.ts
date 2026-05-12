import { Inject, Injectable } from '@nestjs/common';
import { Vehicle } from '../../../domain/entities/vehicle';
import type { VehicleRepositoryInterface } from '../../../domain/repositories/vehicle.repository';
import { VEHICLE_REPOSITORY } from '../../../domain/repositories/tokens';
import type { CreateVehicleInput } from './vehicle.inputs';

@Injectable()
export class CreateVehicleUseCase {
  constructor(
    @Inject(VEHICLE_REPOSITORY)
    private readonly vehicleRepo: VehicleRepositoryInterface,
  ) {}

  async execute(input: CreateVehicleInput): Promise<Vehicle> {
    const vehicle = Vehicle.create({
      plate: input.plate,
      model: input.model,
      brand: input.brand,
      year: input.year,
    });

    return this.vehicleRepo.create(vehicle);
  }
}
