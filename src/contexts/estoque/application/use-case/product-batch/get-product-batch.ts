import { Inject, Injectable } from '@nestjs/common';
import { ProductBatch } from '../../../domain/entities/product-batch';
import type { ProductRepositoryInterface } from '../../../domain/repositories/product.repository';
import type { ProductBatchRepositoryInterface } from '../../../domain/repositories/product-batch.repository';
import {
  PRODUCT_BATCH_REPOSITORY,
  PRODUCT_REPOSITORY,
} from '../../../domain/repositories/tokens';

export type ProductBatchListRow = {
  batch: ProductBatch;
  productName: string;
};

@Injectable()
export class GetProductBatchUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepo: ProductRepositoryInterface,
    @Inject(PRODUCT_BATCH_REPOSITORY)
    private readonly batchRepo: ProductBatchRepositoryInterface,
  ) {}

  async execute(codeProduct: string): Promise<ProductBatchListRow[]> {
    const batches = await this.batchRepo.findByCodeProduct(codeProduct);
    const product = await this.productRepo.findByCodeOrNull(codeProduct);
    const productName = product?.name ?? codeProduct;
    return batches.map((batch) => ({ batch, productName }));
  }
}
