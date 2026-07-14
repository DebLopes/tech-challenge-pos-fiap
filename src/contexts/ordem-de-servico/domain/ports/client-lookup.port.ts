export type ClientSnapshot = {
  id: string;
  document: string;
  name: string;
  email: string;
};

export interface ClientLookupPort {
  findById(id: string): Promise<ClientSnapshot | null>;
}

export const CLIENT_LOOKUP = Symbol('CLIENT_LOOKUP');
