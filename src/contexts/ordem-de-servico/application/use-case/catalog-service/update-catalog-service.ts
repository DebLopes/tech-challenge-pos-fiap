import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CatalogService } from '../../../domain/entities/catalog-service';
import type { CatalogServiceRepositoryInterface } from '../../../domain/repositories/catalog-service.repository';
import type { ProductRepositoryInterface } from '../../../domain/repositories/product.repository';
import {
  CATALOG_SERVICE_REPOSITORY,
  PRODUCT_REPOSITORY,
} from '../../../domain/repositories/tokens';
import type { UpdateCatalogServiceInput } from './catalog-service.inputs';

@Injectable()
export class UpdateCatalogServiceUseCase {
  constructor(
    @Inject(CATALOG_SERVICE_REPOSITORY)
    private readonly catalogRepo: CatalogServiceRepositoryInterface,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepo: ProductRepositoryInterface,
  ) {}

  async execute(
    id: string,
    input: UpdateCatalogServiceInput,
  ): Promise<CatalogService> {
    const existing = await this.catalogRepo.findById(id);
    if (!existing) {
      throw new NotFoundException('Catalog service not found');
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
      throw new BadRequestException(message);
    }

    const updated = await this.catalogRepo.updateById(id, merged);
    if (!updated) {
      throw new NotFoundException('Catalog service not found');
    }
    return updated;
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
