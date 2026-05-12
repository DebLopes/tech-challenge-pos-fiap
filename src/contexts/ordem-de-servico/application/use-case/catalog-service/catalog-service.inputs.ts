import type { CatalogServiceDefaultPart } from '../../../domain/entities/catalog-service';

export type CreateCatalogServiceInput = {
  name: string;
  description?: string;
  basePrice: number;
  active?: boolean;
  defaultParts?: CatalogServiceDefaultPart[];
};

export type UpdateCatalogServiceInput = {
  name?: string;
  description?: string;
  basePrice?: number;
  active?: boolean;
  defaultParts?: CatalogServiceDefaultPart[];
};
