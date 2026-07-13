import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundError } from '../../../../shared/domain/errors';
import { ServiceOrder } from '../../../domain/entities/service-order';
import type { ServiceOrderRepositoryInterface } from '../../../domain/repositories/service-order.repository';
import { SERVICE_ORDER_REPOSITORY } from '../../../domain/repositories/tokens';
import {
  CLIENT_LOOKUP,
  type ClientLookupPort,
} from '../../../domain/services/client-lookup.port';
import {
  VEHICLE_LOOKUP,
  type VehicleLookupPort,
} from '../../../domain/services/vehicle-lookup.port';
import type { CreateServiceOrderInput } from './service-order.inputs';

@Injectable()
export class CreateServiceOrderUseCase {
  constructor(
    @Inject(SERVICE_ORDER_REPOSITORY)
    private readonly orderRepo: ServiceOrderRepositoryInterface,
    @Inject(CLIENT_LOOKUP)
    private readonly clientLookup: ClientLookupPort,
    @Inject(VEHICLE_LOOKUP)
    private readonly vehicleLookup: VehicleLookupPort,
  ) {}

  async execute(input: CreateServiceOrderInput): Promise<ServiceOrder> {
    const client = await this.clientLookup.findById(input.clientId);
    if (!client) {
      throw new EntityNotFoundError(`Client "${input.clientId}" not found`);
    }
    const vehicle = await this.vehicleLookup.findById(input.vehicleId);
    if (!vehicle) {
      throw new EntityNotFoundError(`Vehicle "${input.vehicleId}" not found`);
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
