export enum ServiceOrderStatus {
  RECEIVED = 'RECEIVED',
  IN_DIAGNOSIS = 'IN_DIAGNOSIS',
  WAITING_APPROVAL = 'WAITING_APPROVAL',
  IN_EXECUTION = 'IN_EXECUTION',
  FINISHED = 'FINISHED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export const EDITABLE_STATUSES: ServiceOrderStatus[] = [
  ServiceOrderStatus.RECEIVED,
  ServiceOrderStatus.IN_DIAGNOSIS,
  ServiceOrderStatus.WAITING_APPROVAL,
];

export const SERVICE_ORDER_LISTING_ORDER: ServiceOrderStatus[] = [
  ServiceOrderStatus.IN_EXECUTION,
  ServiceOrderStatus.WAITING_APPROVAL,
  ServiceOrderStatus.IN_DIAGNOSIS,
  ServiceOrderStatus.RECEIVED,
];
