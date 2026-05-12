import { Inject, Injectable } from '@nestjs/common';
import { Product } from '../../../domain/entities/product';
import type { ProductRepositoryInterface } from '../../../domain/repositories/product.repository';
import { PRODUCT_REPOSITORY } from '../../../domain/repositories/tokens';
import type { CreateProductInput } from './product.inputs';

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepo: ProductRepositoryInterface,
  ) {}

  async execute(input: CreateProductInput): Promise<Product> {
    const user = Product.create({
      code: input.code,
      name: input.name,
      description: input.description,
    });
    return this.productRepo.create(user);
  }
}
