export type ProductSnapshot = {
  code: string;
  name: string;
};

export interface ProductLookupPort {
  findByCode(code: string): Promise<ProductSnapshot>;
  findByCodeOrNull(code: string): Promise<ProductSnapshot | null>;
}

export const PRODUCT_LOOKUP = Symbol('PRODUCT_LOOKUP');
