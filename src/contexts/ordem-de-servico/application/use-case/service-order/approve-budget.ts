import { Inject, Injectable } from '@nestjs/common';
import {
  BusinessRuleViolationError,
  EntityNotFoundError,
} from '../../../../shared/domain/errors';
import type { ServiceOrderRepositoryInterface } from '../../../domain/repositories/service-order.repository';
import { SERVICE_ORDER_REPOSITORY } from '../../../domain/repositories/tokens';
import { ServiceOrder } from '../../../domain/entities/service-order';
import {
  STOCK_SERVICE,
  type StockServicePort,
} from '../../../../shared/domain/services/stock-service.port';
import {
  type StockShortageItem,
  conflictExceptionForStockShortage,
} from './stock-shortage';

@Injectable()
export class ApproveBudgetUseCase {
  constructor(
    @Inject(SERVICE_ORDER_REPOSITORY)
    private readonly orderRepo: ServiceOrderRepositoryInterface,
    @Inject(STOCK_SERVICE)
    private readonly stock: StockServicePort,
  ) {}

  async execute(id: string): Promise<ServiceOrder> {
    const order = await this.orderRepo.findById(id);
    if (!order) throw new EntityNotFoundError('Service order not found');

    if (order.isInExecution()) {
      return order;
    }

    const demand = order.aggregatePartDemand();
    const shortages = await this.getStockShortages(demand);
    if (shortages.length > 0) {
      throw conflictExceptionForStockShortage(shortages);
    }

    try {
      order.approveBudget();
      for (const [productCode, required] of demand.entries()) {
        await this.stock.decreaseStock(productCode, required);
      }
      order.startExecution();
    } catch (e) {
      throw new BusinessRuleViolationError(
        e instanceof Error ? e.message : 'Invalid operation',
      );
    }

    const saved = await this.orderRepo.save(order);
    return saved!;
  }

  private async getStockShortages(
    demand: Map<string, number>,
  ): Promise<StockShortageItem[]> {
    const items = Array.from(demand.entries()).map(
      ([productCode, required]) => ({
        productCode,
        required,
      }),
    );
    const availability = await this.stock.getAvailability(items);
    return availability
      .filter((i) => i.available < i.required)
      .map((i) => ({
        productCode: i.productCode,
        required: i.required,
        available: i.available,
      }));
  }
}
