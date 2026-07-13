import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundError } from '../../../../shared/domain/errors';
import { CatalogService } from '../../../domain/entities/catalog-service';
import type { CatalogServiceRepositoryInterface } from '../../../domain/repositories/catalog-service.repository';
import { CATALOG_SERVICE_REPOSITORY } from '../../../domain/repositories/tokens';

@Injectable()
export class GetCatalogServiceUseCase {
  constructor(
    @Inject(CATALOG_SERVICE_REPOSITORY)
    private readonly catalogRepo: CatalogServiceRepositoryInterface,
  ) {}

  async execute(id: string): Promise<CatalogService> {
    const doc = await this.catalogRepo.findById(id);
    if (!doc) {
      throw new EntityNotFoundError('Catalog service not found');
    }
    return doc;
  }
}
