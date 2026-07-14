import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundError } from '../../../../shared/domain/errors';
import { ProductBatch } from '../../../domain/entities/product-batch';
import type { ProductRepositoryInterface } from '../../../domain/repositories/product.repository';
import type { ProductBatchRepositoryInterface } from '../../../domain/repositories/product-batch.repository';
import {
  PRODUCT_BATCH_REPOSITORY,
  PRODUCT_REPOSITORY,
} from '../../../domain/repositories/tokens';
import type { CreateProductBatchInput } from './product-batch.inputs';

export type CreateProductBatchResult = {
  batch: ProductBatch;
  productName: string;
};

@Injectable()
export class CreateProductBatchUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepo: ProductRepositoryInterface,
    @Inject(PRODUCT_BATCH_REPOSITORY)
    private readonly batchRepo: ProductBatchRepositoryInterface,
  ) {}

  async execute(
    input: CreateProductBatchInput,
  ): Promise<CreateProductBatchResult> {
    const code = input.productCode;

    const product = await this.productRepo.findByCodeOrNull(code);

    if (!product) {
      throw new EntityNotFoundError(
        `Product with code "${code}" not found. Please create the product before creating a batch.`,
      );
    }

    const productBatch = ProductBatch.create({
      productCode: input.productCode,
      quantity: input.quantity,
      costPrice: input.costPrice,
      salePrice: input.salePrice,
    });

    const saved = await this.batchRepo.create(productBatch);

    return {
      batch: saved,
      productName: product.name,
    };
  }
}
