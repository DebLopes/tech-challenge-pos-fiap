import { Product, type ProductProps } from '../entities/product';

export interface ProductRepositoryInterface {
  create: (data: Product) => Promise<Product>;
  find: () => Promise<Product[]>;
  findByCodeOrNull: (code: string) => Promise<Product | null>;
  findByCode: (code: string) => Promise<Product>;
  updateByCode: (
    code: string,
    dataUpdate: Partial<Pick<ProductProps, 'name' | 'description'>>,
  ) => Promise<Product>;
  remove: (code: string) => Promise<void>;
}
