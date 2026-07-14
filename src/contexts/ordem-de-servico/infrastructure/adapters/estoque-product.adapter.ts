import { Inject, Injectable } from '@nestjs/common';
import { Product } from '../../../estoque/domain/entities/product';
import type { ProductRepositoryInterface } from '../../../estoque/domain/repositories/product.repository';
import { PRODUCT_REPOSITORY } from '../../../estoque/domain/repositories/tokens';
import { CreateProductUseCase } from '../../../estoque/application/use-case/product/create-product';
import type {
  ProductLookupPort,
  ProductSnapshot,
} from '../../domain/ports/product-lookup.port';
import type {
  ProductProvisioningPort,
  ProvisionProductInput,
} from '../../domain/ports/product-provisioning.port';

@Injectable()
export class EstoqueProductAdapter
  implements ProductLookupPort, ProductProvisioningPort
{
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepo: ProductRepositoryInterface,
    private readonly createProduct: CreateProductUseCase,
  ) {}

  async findByCode(code: string): Promise<ProductSnapshot> {
    const product = await this.productRepo.findByCode(code);
    return this.toSnapshot(product);
  }

  async findByCodeOrNull(code: string): Promise<ProductSnapshot | null> {
    const product = await this.productRepo.findByCodeOrNull(code);
    return product ? this.toSnapshot(product) : null;
  }

  async getOrCreate(input: ProvisionProductInput): Promise<ProductSnapshot> {
    const existing = await this.productRepo.findByCodeOrNull(input.code);
    if (existing) {
      return this.toSnapshot(existing);
    }
    const created = await this.createProduct.execute(input);
    return this.toSnapshot(created);
  }

  private toSnapshot(product: Product): ProductSnapshot {
    return {
      code: product.code,
      name: product.name,
    };
  }
}
