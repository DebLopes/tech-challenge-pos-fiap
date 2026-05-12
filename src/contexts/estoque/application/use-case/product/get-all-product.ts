import { Inject, Injectable } from '@nestjs/common';
import { Product } from '../../../domain/entities/product';
import type { ProductRepositoryInterface } from '../../../domain/repositories/product.repository';
import { PRODUCT_REPOSITORY } from '../../../domain/repositories/tokens';

@Injectable()
export class GetAllProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepo: ProductRepositoryInterface,
  ) {}

  async execute(): Promise<Product[]> {
    return this.productRepo.find();
  }
}
