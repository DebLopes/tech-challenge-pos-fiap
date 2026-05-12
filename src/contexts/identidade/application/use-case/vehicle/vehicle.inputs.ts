export type CreateVehicleInput = {
  plate: string;
  model: string;
  brand: string;
  year: number;
};

export type UpdateVehicleInput = {
  model?: string;
  brand?: string;
  year?: number;
};
