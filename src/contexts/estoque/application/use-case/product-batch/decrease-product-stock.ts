import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { sumProductBatchQuantities } from '../../../domain/entities/product-batch';
import type { ProductBatchRepositoryInterface } from '../../../domain/repositories/product-batch.repository';
import { PRODUCT_BATCH_REPOSITORY } from '../../../domain/repositories/tokens';

export type StockConsumption = {
  batchId: string;
  quantityConsumed: number;
  salePrice: number;
};

export type DecreaseStockResult = {
  productCode: string;
  totalConsumed: number;
  totalCost: number;
  consumptions: StockConsumption[];
};

@Injectable()
export class DecreaseProductStockUseCase {
  constructor(
    @Inject(PRODUCT_BATCH_REPOSITORY)
    private readonly productBatchRepo: ProductBatchRepositoryInterface,
  ) {}

  async execute(
    productCode: string,
    quantity: number,
  ): Promise<DecreaseStockResult> {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than zero');
    }

    const batches =
      await this.productBatchRepo.findAvailableByCode(productCode);
    const available = sumProductBatchQuantities(batches);

    if (available < quantity) {
      throw new BadRequestException(
        `Insufficient stock for product "${productCode}". Available: ${available}, required: ${quantity}.`,
      );
    }

    let remaining = quantity;
    let totalCost = 0;
    const consumptions: StockConsumption[] = [];

    for (const batch of batches) {
      if (remaining === 0) break;
      const take = Math.min(batch.quantity, remaining);
      const newQuantity = batch.quantity - take;
      await this.productBatchRepo.updateById(batch.id, {
        quantity: newQuantity,
      });
      consumptions.push({
        batchId: batch.id,
        quantityConsumed: take,
        salePrice: batch.salePrice,
      });
      totalCost += take * batch.salePrice;
      remaining -= take;
    }

    return {
      productCode,
      totalConsumed: quantity,
      totalCost,
      consumptions,
    };
  }
}
