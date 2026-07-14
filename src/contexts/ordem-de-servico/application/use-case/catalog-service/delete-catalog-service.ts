import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundError } from '../../../../shared/domain/errors';
import type { CatalogServiceRepositoryInterface } from '../../../domain/repositories/catalog-service.repository';
import { CATALOG_SERVICE_REPOSITORY } from '../../../domain/repositories/tokens';

@Injectable()
export class DeleteCatalogServiceUseCase {
  constructor(
    @Inject(CATALOG_SERVICE_REPOSITORY)
    private readonly catalogRepo: CatalogServiceRepositoryInterface,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.catalogRepo.findById(id);
    if (!existing) {
      throw new EntityNotFoundError('Catalog service not found');
    }
    await this.catalogRepo.remove(id);
  }
}
