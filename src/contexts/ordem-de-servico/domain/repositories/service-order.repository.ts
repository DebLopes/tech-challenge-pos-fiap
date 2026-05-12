import { ServiceOrder } from '../entities/service-order';

export interface ServiceOrderRepositoryInterface {
  create: (order: ServiceOrder) => Promise<ServiceOrder>;
  find: () => Promise<ServiceOrder[]>;
  findById: (id: string) => Promise<ServiceOrder | null>;
  findOpenByDocument: (
    document: string,
    plate?: string,
  ) => Promise<ServiceOrder[]>;
  findFinished: () => Promise<ServiceOrder[]>;
  save: (order: ServiceOrder) => Promise<ServiceOrder | null>;
}
