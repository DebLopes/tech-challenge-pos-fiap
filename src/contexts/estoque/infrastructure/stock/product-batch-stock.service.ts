import { Inject, Injectable } from '@nestjs/common';
import { sumProductBatchQuantities } from '../../domain/entities/product-batch';
import type { ProductBatchRepositoryInterface } from '../../domain/repositories/product-batch.repository';
import { PRODUCT_BATCH_REPOSITORY } from '../../domain/repositories/tokens';
import { simulateFifoCost } from '../../domain/services/budget-pricing';
import type {
  StockAvailabilityItem,
  StockDemandItem,
  StockQuoteItem,
  StockServicePort,
} from '../../../shared/domain/ports/stock-service.port';
import { DecreaseProductStockUseCase } from '../../application/use-case/product-batch/decrease-product-stock';

@Injectable()
export class ProductBatchStockService implements StockServicePort {
  constructor(
    @Inject(PRODUCT_BATCH_REPOSITORY)
    private readonly batchRepo: ProductBatchRepositoryInterface,
    private readonly decreaseStockUseCase: DecreaseProductStockUseCase,
  ) {}

  async getAvailability(
    demand: StockDemandItem[],
  ): Promise<StockAvailabilityItem[]> {
    const uniqueByCode = new Map<string, number>();
    for (const item of demand) {
      uniqueByCode.set(
        item.productCode,
        (uniqueByCode.get(item.productCode) ?? 0) + item.required,
      );
    }

    const result: StockAvailabilityItem[] = [];
    for (const [productCode, required] of uniqueByCode.entries()) {
      const batches = await this.batchRepo.findAvailableByCode(productCode);
      const available = sumProductBatchQuantities(batches);
      result.push({ productCode, required, available });
    }
    return result;
  }

  async quoteFifoCost(demand: StockDemandItem[]): Promise<StockQuoteItem[]> {
    const result: StockQuoteItem[] = [];
    for (const { productCode, required } of demand) {
      if (required <= 0) {
        result.push({ productCode, required, totalCost: 0, unitPrice: 0 });
        continue;
      }
      const batches = await this.batchRepo.findAvailableByCode(productCode);
      const { totalCost } = simulateFifoCost(batches, required);
      const unitPrice = required > 0 ? totalCost / required : 0;
      result.push({
        productCode,
        required,
        totalCost,
        unitPrice: Number.isFinite(unitPrice) ? unitPrice : 0,
      });
    }
    return result;
  }

  async decreaseStock(productCode: string, quantity: number): Promise<void> {
    await this.decreaseStockUseCase.execute(productCode, quantity);
  }
}
