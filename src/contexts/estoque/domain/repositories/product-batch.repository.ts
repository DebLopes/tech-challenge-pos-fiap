import {
  ProductBatch,
  type ProductBatchProps,
} from '../entities/product-batch';

export interface ProductBatchRepositoryInterface {
  create: (data: ProductBatch) => Promise<ProductBatch>;
  find: () => Promise<ProductBatch[]>;
  findByCodeProduct(code: string): Promise<ProductBatch[]>;
  findAvailableByCode(code: string): Promise<ProductBatch[]>;
  updateById: (
    id: string,
    dataUpdate: Partial<ProductBatchProps>,
  ) => Promise<ProductBatch>;
  remove: (id: string) => Promise<void>;
}
