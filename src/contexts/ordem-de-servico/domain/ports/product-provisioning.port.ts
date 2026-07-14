import type { ProductSnapshot } from './product-lookup.port';

export type ProvisionProductInput = {
  code: string;
  name: string;
  description?: string;
};

export interface ProductProvisioningPort {
  getOrCreate(input: ProvisionProductInput): Promise<ProductSnapshot>;
}

export const PRODUCT_PROVISIONING = Symbol('PRODUCT_PROVISIONING');
