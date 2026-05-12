export type CreateProductInput = {
  code: string;
  name: string;
  description?: string;
};

export type UpdateProductInput = {
  name?: string;
  description?: string;
};
