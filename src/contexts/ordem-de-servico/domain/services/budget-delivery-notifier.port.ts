import type { Budget } from '../entities/service-order';

export const BUDGET_DELIVERY_NOTIFIER = Symbol('BUDGET_DELIVERY_NOTIFIER');

export type BudgetDeliveryPayload = {
  serviceOrderId: string;
  clientDocument: string;
  clientName: string;
  clientEmail: string;
  vehiclePlate: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: number;
  budget: Budget;
};

export interface BudgetDeliveryNotifier {
  notifyBudgetReady(payload: BudgetDeliveryPayload): Promise<void>;
}
