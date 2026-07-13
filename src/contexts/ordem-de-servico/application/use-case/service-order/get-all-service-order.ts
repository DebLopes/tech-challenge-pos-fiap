import { Inject, Injectable } from '@nestjs/common';
import { ServiceOrder } from '../../../domain/entities/service-order';
import {
  SERVICE_ORDER_LISTING_ORDER,
  ServiceOrderStatus,
} from '../../../domain/entities/service-order-status';
import type { ServiceOrderRepositoryInterface } from '../../../domain/repositories/service-order.repository';
import { SERVICE_ORDER_REPOSITORY } from '../../../domain/repositories/tokens';

@Injectable()
export class GetAllServiceOrdersUseCase {
  constructor(
    @Inject(SERVICE_ORDER_REPOSITORY)
    private readonly orderRepo: ServiceOrderRepositoryInterface,
  ) {}

  async execute(): Promise<ServiceOrder[]> {
    const list = await this.orderRepo.find();
    return list.sort(
      (a, b) =>
        this.statusRank(a.status) - this.statusRank(b.status) ||
        a.createdAt.getTime() - b.createdAt.getTime(),
    );
  }

  private statusRank(status: ServiceOrderStatus): number {
    const index = SERVICE_ORDER_LISTING_ORDER.indexOf(status);
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
  }
}
