export type CreateServiceOrderInput = {
  clientId: string;
  vehicleId: string;
  requestedServicesDescription?: string;
};

export type OpenServiceOrderInput = {
  client: {
    name: string;
    document: string;
    email: string;
  };
  vehicle: {
    plate: string;
    model: string;
    brand: string;
    year: number;
  };
  requestedServicesDescription?: string;
  services?: { catalogServiceId: string; quantity?: number }[];
  parts?: { productCode: string; quantity: number }[];
};
