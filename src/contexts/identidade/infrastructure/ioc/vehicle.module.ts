import { Module } from '@nestjs/common';
import {
  CreateVehicleUseCase,
  DeleteVehicleUseCase,
  GetAllVehiclesUseCase,
  GetVehicleUseCase,
  UpdatedVehicleUseCase,
} from '../../application/use-case/vehicle';
import { VehicleController } from '../../interfaces/http/vehicle/vehicle.controller';
import { IdentidadeDatabaseModule } from '../database/database.module';

@Module({
  imports: [IdentidadeDatabaseModule],
  providers: [
    CreateVehicleUseCase,
    DeleteVehicleUseCase,
    GetAllVehiclesUseCase,
    GetVehicleUseCase,
    UpdatedVehicleUseCase,
  ],
  controllers: [VehicleController],
  exports: [CreateVehicleUseCase, IdentidadeDatabaseModule],
})
export class VehicleModule {}
