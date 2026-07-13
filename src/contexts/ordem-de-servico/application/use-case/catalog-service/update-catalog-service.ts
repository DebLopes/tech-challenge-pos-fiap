import { Inject, Injectable } from '@nestjs/common';
import {
  BusinessRuleViolationError,
  EntityNotFoundError,
} from '../../../../shared/domain/errors';
import { CatalogService } from '../../../domain/entities/catalog-service';
import type { CatalogServiceRepositoryInterface } from '../../../domain/repositories/catalog-service.repository';
import { CATALOG_SERVICE_REPOSITORY } from '../../../domain/repositories/tokens';
import {
  PRODUCT_LOOKUP,
  type ProductLookupPort,
} from '../../../domain/services/product-lookup.port';
import type { UpdateCatalogServiceInput } from './catalog-service.inputs';

@Injectable()
export class UpdateCatalogServiceUseCase {
  constructor(
    @Inject(CATALOG_SERVICE_REPOSITORY)
    private readonly catalogRepo: CatalogServiceRepositoryInterface,
    @Inject(PRODUCT_LOOKUP)
    private readonly productLookup: ProductLookupPort,
  ) {}

  async execute(
    id: string,
    input: UpdateCatalogServiceInput,
  ): Promise<CatalogService> {
    const existing = await this.catalogRepo.findById(id);
    if (!existing) {
      throw new EntityNotFoundError('Catalog service not found');
    }

    if (input.defaultParts) {
      await this.assertProductsExist(
        input.defaultParts.map((p) => p.productCode.trim().toUpperCase()),
      );
    }

    const merged = {
      name: input.name ?? existing.name,
      description:
        input.description !== undefined
          ? input.description
          : existing.description,
      basePrice: input.basePrice ?? existing.basePrice,
      active: input.active ?? existing.active,
      defaultParts:
        input.defaultParts !== undefined
          ? input.defaultParts.map((p) => ({
              productCode: p.productCode,
              quantity: p.quantity,
            }))
          : (existing.defaultParts ?? []).map((p) => ({
              productCode: p.productCode,
              quantity: p.quantity,
            })),
    };

    try {
      CatalogService.create(merged, existing.id);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : 'Invalid catalog service';
      throw new BusinessRuleViolationError(message);
    }

    const updated = await this.catalogRepo.updateById(id, merged);
    if (!updated) {
      throw new EntityNotFoundError('Catalog service not found');
    }
    return updated;
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
