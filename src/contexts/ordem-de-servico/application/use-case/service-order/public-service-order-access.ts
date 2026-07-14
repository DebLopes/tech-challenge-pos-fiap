import {
  BusinessRuleViolationError,
  EntityNotFoundError,
} from '../../../../shared/domain/errors';
import type { ServiceOrder } from '../../../domain/entities/service-order';
import type { ServiceOrderRepositoryInterface } from '../../../domain/repositories/service-order.repository';

export const PUBLIC_SERVICE_ORDER_ACCESS_DENIED = 'Orçamento não encontrado';

export function normalizePublicDocument(doc: string): string {
  return doc.replace(/\D/g, '');
}

export function normalizePublicPlate(plate: string): string {
  return plate.replace(/-/g, '').toUpperCase();
}

export function assertPublicServiceOrderIdentity(
  order: ServiceOrder,
  document: string,
  plate?: string,
): void {
  const docTrim = document?.trim();
  if (!docTrim) {
    throw new BusinessRuleViolationError('Parâmetro document é obrigatório');
  }
  const docQuery = normalizePublicDocument(docTrim);
  const docStored = normalizePublicDocument(order.clientDocument);
  if (docQuery !== docStored) {
    throw new EntityNotFoundError(PUBLIC_SERVICE_ORDER_ACCESS_DENIED);
  }
  if (plate?.trim()) {
    const pQ = normalizePublicPlate(plate.trim());
    const pS = normalizePublicPlate(order.vehiclePlate);
    if (pQ !== pS) {
      throw new EntityNotFoundError(PUBLIC_SERVICE_ORDER_ACCESS_DENIED);
    }
  }
}

export async function loadServiceOrderForPublicClient(
  repo: ServiceOrderRepositoryInterface,
  serviceOrderId: string,
  document: string,
  plate?: string,
): Promise<ServiceOrder> {
  const docTrim = document?.trim();
  if (!docTrim) {
    throw new BusinessRuleViolationError('Parâmetro document é obrigatório');
  }
  const order = await repo.findById(serviceOrderId);
  if (!order) {
    throw new EntityNotFoundError(PUBLIC_SERVICE_ORDER_ACCESS_DENIED);
  }
  assertPublicServiceOrderIdentity(order, document, plate);
  return order;
}
