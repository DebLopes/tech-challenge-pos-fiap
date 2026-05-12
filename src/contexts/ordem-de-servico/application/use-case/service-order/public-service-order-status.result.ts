import type { ServiceOrderStatus } from '../../../domain/entities/service-order-status';

export type PublicServiceOrderStatusItemResult = {
  serviceOrderId: string;
  vehiclePlate: string;
  status: ServiceOrderStatus;
  createdAt: Date;
  updatedAt: Date;
  budgetTotal?: number;
  budgetApproved: boolean;
  startedAt?: Date;
  finishedAt?: Date;
};
