export type ClientCreateBody = {
  name: string;
  document: string;
  email: string;
};

export const VALID_CPF_CLIENTS = '11144477735';

export function newClientCreateBody(
  overrides: Partial<ClientCreateBody> = {},
): ClientCreateBody {
  return {
    name: 'Cliente integração',
    document: VALID_CPF_CLIENTS,
    email: 'integration-client@test.dev',
    ...overrides,
  };
}
