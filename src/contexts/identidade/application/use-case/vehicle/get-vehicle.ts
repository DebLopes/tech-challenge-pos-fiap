import { Inject, Injectable } from '@nestjs/common';
import { Vehicle } from '../../../domain/entities/vehicle';
import type { VehicleRepositoryInterface } from '../../../domain/repositories/vehicle.repository';
import { VEHICLE_REPOSITORY } from '../../../domain/repositories/tokens';

@Injectable()
export class GetVehicleUseCase {
  constructor(
    @Inject(VEHICLE_REPOSITORY)
    private readonly vehicleRepo: VehicleRepositoryInterface,
  ) {}

  async execute(plate: string): Promise<Vehicle> {
    return this.vehicleRepo.findByPlate(plate);
  }
}
