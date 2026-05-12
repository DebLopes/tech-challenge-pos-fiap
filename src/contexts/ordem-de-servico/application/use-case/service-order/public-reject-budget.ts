import { Inject, Injectable } from '@nestjs/common';
import { ServiceOrder } from '../../../domain/entities/service-order';
import type { ServiceOrderRepositoryInterface } from '../../../domain/repositories/service-order.repository';
import { SERVICE_ORDER_REPOSITORY } from '../../../domain/repositories/tokens';
import { loadServiceOrderForPublicClient } from './public-service-order-access';
import { RejectBudgetUseCase } from './reject-budget';

@Injectable()
export class PublicRejectBudgetUseCase {
  constructor(
    @Inject(SERVICE_ORDER_REPOSITORY)
    private readonly orderRepo: ServiceOrderRepositoryInterface,
    private readonly rejectBudget: RejectBudgetUseCase,
  ) {}

  async execute(
    serviceOrderId: string,
    document: string,
    plate: string | undefined,
    reason?: string,
  ): Promise<ServiceOrder> {
    await loadServiceOrderForPublicClient(
      this.orderRepo,
      serviceOrderId,
      document,
      plate,
    );
    return this.rejectBudget.execute(serviceOrderId, reason);
  }
}
