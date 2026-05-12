import { Inject, Injectable } from '@nestjs/common';
import { sumProductBatchQuantities } from '../../../domain/entities/product-batch';
import type { ProductBatchRepositoryInterface } from '../../../domain/repositories/product-batch.repository';
import { PRODUCT_BATCH_REPOSITORY } from '../../../domain/repositories/tokens';

export type ProductStockResult = {
  productCode: string;
  available: number;
};

@Injectable()
export class GetProductStockUseCase {
  constructor(
    @Inject(PRODUCT_BATCH_REPOSITORY)
    private readonly productBatchRepo: ProductBatchRepositoryInterface,
  ) {}

  async execute(productCode: string): Promise<ProductStockResult> {
    const batches =
      await this.productBatchRepo.findAvailableByCode(productCode);
    const available = sumProductBatchQuantities(batches);
    return { productCode, available };
  }
}
