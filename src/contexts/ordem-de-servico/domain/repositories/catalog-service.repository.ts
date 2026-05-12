import type { CatalogServiceProps } from '../entities/catalog-service';
import { CatalogService } from '../entities/catalog-service';

export type CatalogServiceUpdateInput = Partial<
  Pick<
    CatalogServiceProps,
    'name' | 'description' | 'basePrice' | 'active' | 'defaultParts'
  >
>;

export interface CatalogServiceRepositoryInterface {
  create: (data: CatalogService) => Promise<CatalogService>;
  find: () => Promise<CatalogService[]>;
  findById: (id: string) => Promise<CatalogService | null>;
  updateById: (
    id: string,
    data: CatalogServiceUpdateInput,
  ) => Promise<CatalogService | null>;
  remove: (id: string) => Promise<void>;
}
