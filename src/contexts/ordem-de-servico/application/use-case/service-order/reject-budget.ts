import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ServiceOrder } from '../../../domain/entities/service-order';
import type { ServiceOrderRepositoryInterface } from '../../../domain/repositories/service-order.repository';
import { SERVICE_ORDER_REPOSITORY } from '../../../domain/repositories/tokens';

@Injectable()
export class RejectBudgetUseCase {
  constructor(
    @Inject(SERVICE_ORDER_REPOSITORY)
    private readonly orderRepo: ServiceOrderRepositoryInterface,
  ) {}

  async execute(id: string, reason?: string): Promise<ServiceOrder> {
    const order = await this.orderRepo.findById(id);
    if (!order) throw new NotFoundException('Service order not found');
    try {
      order.rejectBudget(reason);
    } catch (e) {
      throw new BadRequestException(
        e instanceof Error ? e.message : 'Invalid operation',
      );
    }

    const saved = await this.orderRepo.save(order);
    return saved!;
  }
}
