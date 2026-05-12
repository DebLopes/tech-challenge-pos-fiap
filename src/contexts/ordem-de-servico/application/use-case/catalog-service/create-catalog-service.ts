import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CatalogService } from '../../../domain/entities/catalog-service';
import type { CatalogServiceRepositoryInterface } from '../../../domain/repositories/catalog-service.repository';
import type { ProductRepositoryInterface } from '../../../domain/repositories/product.repository';
import {
  CATALOG_SERVICE_REPOSITORY,
  PRODUCT_REPOSITORY,
} from '../../../domain/repositories/tokens';
import type { CreateCatalogServiceInput } from './catalog-service.inputs';

@Injectable()
export class CreateCatalogServiceUseCase {
  constructor(
    @Inject(CATALOG_SERVICE_REPOSITORY)
    private readonly catalogRepo: CatalogServiceRepositoryInterface,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepo: ProductRepositoryInterface,
  ) {}

  async execute(input: CreateCatalogServiceInput): Promise<CatalogService> {
    const defaultParts = input.defaultParts ?? [];
    await this.assertProductsExist(
      defaultParts.map((p) => p.productCode.trim().toUpperCase()),
    );

    let entity: CatalogService;
    try {
      entity = CatalogService.create({
        name: input.name,
        description: input.description,
        basePrice: input.basePrice,
        active: input.active ?? true,
        defaultParts: defaultParts.map((p) => ({
          productCode: p.productCode,
          quantity: p.quantity,
        })),
      });
    } catch (e) {
      const message =
        e instanceof Error ? e.message : 'Invalid catalog service';
      throw new BadRequestException(message);
    }

    return this.catalogRepo.create(entity);
  }

  private async assertProductsExist(codes: string[]): Promise<void> {
    for (const code of codes) {
      const product = await this.productRepo.findByCodeOrNull(code);
      if (!product) {
        throw new BadRequestException(
          `Product with code "${code}" not found. Register the product before linking.`,
        );
      }
    }
  }
}
