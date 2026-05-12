import { Inject, Injectable } from '@nestjs/common';
import { CatalogService } from '../../../domain/entities/catalog-service';
import type { CatalogServiceRepositoryInterface } from '../../../domain/repositories/catalog-service.repository';
import { CATALOG_SERVICE_REPOSITORY } from '../../../domain/repositories/tokens';

@Injectable()
export class GetAllCatalogServicesUseCase {
  constructor(
    @Inject(CATALOG_SERVICE_REPOSITORY)
    private readonly catalogRepo: CatalogServiceRepositoryInterface,
  ) {}

  async execute(): Promise<CatalogService[]> {
    return this.catalogRepo.find();
  }
}
