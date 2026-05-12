export type CreateClientInput = {
  name: string;
  document: string;
  email: string;
};

export type UpdateClientInput = {
  name?: string;
  email?: string;
};
