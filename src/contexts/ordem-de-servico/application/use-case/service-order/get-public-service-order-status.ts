import { Inject, Injectable } from '@nestjs/common';
import type { ServiceOrderRepositoryInterface } from '../../../domain/repositories/service-order.repository';
import { SERVICE_ORDER_REPOSITORY } from '../../../domain/repositories/tokens';
import type { PublicServiceOrderStatusItemResult } from './public-service-order-status.result';

@Injectable()
export class GetPublicServiceOrderStatusUseCase {
  constructor(
    @Inject(SERVICE_ORDER_REPOSITORY)
    private readonly orderRepo: ServiceOrderRepositoryInterface,
  ) {}

  async execute(
    document: string,
    plate?: string,
  ): Promise<PublicServiceOrderStatusItemResult[]> {
    const list = await this.orderRepo.findOpenByDocument(document, plate);
    return list.map((m) => ({
      serviceOrderId: m.id,
      vehiclePlate: m.vehiclePlate,
      status: m.status,
      createdAt: m.createdAt ?? new Date(),
      updatedAt: m.updatedAt ?? new Date(),
      budgetTotal: m.budget?.total,
      budgetApproved: m.budget?.approved ?? false,
      startedAt: m.startedAt,
      finishedAt: m.finishedAt,
    }));
  }
}
