import { Inject, Injectable } from '@nestjs/common';
import { Product } from '../../../domain/entities/product';
import type { ProductRepositoryInterface } from '../../../domain/repositories/product.repository';
import { PRODUCT_REPOSITORY } from '../../../domain/repositories/tokens';

@Injectable()
export class GetProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepo: ProductRepositoryInterface,
  ) {}

  async execute(code: string): Promise<Product> {
    return this.productRepo.findByCode(code);
  }
}
