import { Inject, Injectable } from '@nestjs/common';
import { Product } from '../../../domain/entities/product';
import type { ProductRepositoryInterface } from '../../../domain/repositories/product.repository';
import { PRODUCT_REPOSITORY } from '../../../domain/repositories/tokens';
import type { UpdateProductInput } from './product.inputs';

@Injectable()
export class UpdateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepo: ProductRepositoryInterface,
  ) {}

  async execute(code: string, input: UpdateProductInput): Promise<Product> {
    return this.productRepo.updateByCode(code, input);
  }
}
