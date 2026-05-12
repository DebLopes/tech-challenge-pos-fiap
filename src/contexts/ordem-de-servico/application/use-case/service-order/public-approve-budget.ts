import { Inject, Injectable } from '@nestjs/common';
import { ServiceOrder } from '../../../domain/entities/service-order';
import type { ServiceOrderRepositoryInterface } from '../../../domain/repositories/service-order.repository';
import { SERVICE_ORDER_REPOSITORY } from '../../../domain/repositories/tokens';
import { ApproveBudgetUseCase } from './approve-budget';
import { loadServiceOrderForPublicClient } from './public-service-order-access';

@Injectable()
export class PublicApproveBudgetUseCase {
  constructor(
    @Inject(SERVICE_ORDER_REPOSITORY)
    private readonly orderRepo: ServiceOrderRepositoryInterface,
    private readonly approveBudget: ApproveBudgetUseCase,
  ) {}

  async execute(
    serviceOrderId: string,
    document: string,
    plate?: string,
  ): Promise<ServiceOrder> {
    await loadServiceOrderForPublicClient(
      this.orderRepo,
      serviceOrderId,
      document,
      plate,
    );
    return this.approveBudget.execute(serviceOrderId);
  }
}
