import { Inject, Injectable } from '@nestjs/common';
import { BusinessRuleViolationError } from '../../../../shared/domain/errors';
import { CatalogService } from '../../../domain/entities/catalog-service';
import type { CatalogServiceRepositoryInterface } from '../../../domain/repositories/catalog-service.repository';
import { CATALOG_SERVICE_REPOSITORY } from '../../../domain/repositories/tokens';
import {
  PRODUCT_LOOKUP,
  type ProductLookupPort,
} from '../../../domain/ports/product-lookup.port';
import type { CreateCatalogServiceInput } from './catalog-service.inputs';

@Injectable()
export class CreateCatalogServiceUseCase {
  constructor(
    @Inject(CATALOG_SERVICE_REPOSITORY)
    private readonly catalogRepo: CatalogServiceRepositoryInterface,
    @Inject(PRODUCT_LOOKUP)
    private readonly productLookup: ProductLookupPort,
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
      throw new BusinessRuleViolationError(message);
    }

    return this.catalogRepo.create(entity);
  }

  private async assertProductsExist(codes: string[]): Promise<void> {
    for (const code of codes) {
      const product = await this.productLookup.findByCodeOrNull(code);
      if (!product) {
        throw new BusinessRuleViolationError(
          `Product with code "${code}" not found. Register the product before linking.`,
        );
      }
    }
  }
}
