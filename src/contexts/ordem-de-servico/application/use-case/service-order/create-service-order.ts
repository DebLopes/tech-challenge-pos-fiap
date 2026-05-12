import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ServiceOrder } from '../../../domain/entities/service-order';
import type { ServiceOrderRepositoryInterface } from '../../../domain/repositories/service-order.repository';
import type { ClientRepositoryInterface } from '../../../../identidade/domain/repositories/client.repository';
import type { VehicleRepositoryInterface } from '../../../../identidade/domain/repositories/vehicle.repository';
import { SERVICE_ORDER_REPOSITORY } from '../../../domain/repositories/tokens';
import {
  CLIENT_REPOSITORY,
  VEHICLE_REPOSITORY,
} from '../../../../identidade/domain/repositories/tokens';
import type { CreateServiceOrderInput } from './service-order.inputs';

@Injectable()
export class CreateServiceOrderUseCase {
  constructor(
    @Inject(SERVICE_ORDER_REPOSITORY)
    private readonly orderRepo: ServiceOrderRepositoryInterface,
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepo: ClientRepositoryInterface,
    @Inject(VEHICLE_REPOSITORY)
    private readonly vehicleRepo: VehicleRepositoryInterface,
  ) {}

  async execute(input: CreateServiceOrderInput): Promise<ServiceOrder> {
    const client = await this.clientRepo.findById(input.clientId);
    if (!client) {
      throw new NotFoundException(`Client "${input.clientId}" not found`);
    }
    const vehicle = await this.vehicleRepo.findById(input.vehicleId);
    if (!vehicle) {
      throw new NotFoundException(`Vehicle "${input.vehicleId}" not found`);
    }

    const order = ServiceOrder.create({
      client: {
        id: client.id,
        document: client.document,
        name: client.name,
      },
      vehicle: {
        id: vehicle.id,
        plate: vehicle.plate,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
      },
      requestedServicesDescription: input.requestedServicesDescription,
    });

    return this.orderRepo.create(order);
  }
}
