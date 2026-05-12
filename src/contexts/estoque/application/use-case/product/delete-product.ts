import { Inject, Injectable } from '@nestjs/common';
import type { ProductRepositoryInterface } from '../../../domain/repositories/product.repository';
import { PRODUCT_REPOSITORY } from '../../../domain/repositories/tokens';

@Injectable()
export class DeleteProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepo: ProductRepositoryInterface,
  ) {}

  async execute(code: string): Promise<void> {
    await this.productRepo.remove(code);
  }
}
