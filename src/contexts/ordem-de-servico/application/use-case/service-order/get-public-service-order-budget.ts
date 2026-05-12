import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Budget } from '../../../domain/entities/service-order';
import type { ServiceOrderRepositoryInterface } from '../../../domain/repositories/service-order.repository';
import { SERVICE_ORDER_REPOSITORY } from '../../../domain/repositories/tokens';
import {
  loadServiceOrderForPublicClient,
  PUBLIC_SERVICE_ORDER_ACCESS_DENIED,
} from './public-service-order-access';

@Injectable()
export class GetPublicServiceOrderBudgetUseCase {
  constructor(
    @Inject(SERVICE_ORDER_REPOSITORY)
    private readonly orderRepo: ServiceOrderRepositoryInterface,
  ) {}

  async execute(
    serviceOrderId: string,
    document: string,
    plate?: string,
  ): Promise<Budget> {
    const order = await loadServiceOrderForPublicClient(
      this.orderRepo,
      serviceOrderId,
      document,
      plate,
    );

    if (!order.budget) {
      throw new NotFoundException(PUBLIC_SERVICE_ORDER_ACCESS_DENIED);
    }

    return order.budget;
  }
}
