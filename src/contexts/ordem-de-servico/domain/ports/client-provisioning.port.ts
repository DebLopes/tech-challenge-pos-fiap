import type { ClientSnapshot } from './client-lookup.port';

export type ProvisionClientInput = {
  name: string;
  document: string;
  email: string;
};

export interface ClientProvisioningPort {
  getOrCreate(input: ProvisionClientInput): Promise<ClientSnapshot>;
}

export const CLIENT_PROVISIONING = Symbol('CLIENT_PROVISIONING');
