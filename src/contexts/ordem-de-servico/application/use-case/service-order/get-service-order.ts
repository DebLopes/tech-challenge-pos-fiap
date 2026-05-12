import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ServiceOrder } from '../../../domain/entities/service-order';
import type { ServiceOrderRepositoryInterface } from '../../../domain/repositories/service-order.repository';
import { SERVICE_ORDER_REPOSITORY } from '../../../domain/repositories/tokens';

@Injectable()
export class GetServiceOrderUseCase {
  constructor(
    @Inject(SERVICE_ORDER_REPOSITORY)
    private readonly orderRepo: ServiceOrderRepositoryInterface,
  ) {}

  async execute(id: string): Promise<ServiceOrder> {
    const model = await this.orderRepo.findById(id);
    if (!model) throw new NotFoundException('Service order not found');
    return model;
  }
}
