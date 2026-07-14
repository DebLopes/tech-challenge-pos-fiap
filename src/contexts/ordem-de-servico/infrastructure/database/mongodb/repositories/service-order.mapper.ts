import {
  ServiceOrder,
  type BudgetItem,
  type ServiceOrderProps,
} from '../../../../domain/entities/service-order';
import { DocumentVO } from '../../../../../shared/domain/value-objects/document.vo';
import { PlateVO } from '../../../../../shared/domain/value-objects/plate.vo';
import { Money } from '../../../../../shared/domain/value-objects/money.vo';
import type { ServiceOrderModel } from '../models/service-order/service-order.model';

type LegacyServiceOrderFlat = {
  clientId?: string;
  clientDocument?: string;
  clientName?: string;
  vehicleId?: string;
  vehiclePlate?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleYear?: number;
};

function mapBudgetItem(raw: {
  type: string;
  referenceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}): BudgetItem {
  return {
    type: raw.type as BudgetItem['type'],
    referenceId: raw.referenceId,
    description: raw.description,
    quantity: raw.quantity,
    unitPrice: raw.unitPrice,
    total: raw.total,
  };
}

function resolveClientSnapshot(
  model: ServiceOrderModel & LegacyServiceOrderFlat,
): ServiceOrderProps['client'] {
  if (model.client?.id != null && model.client.document != null) {
    return {
      id: model.client.id,
      document: DocumentVO.parse(model.client.document),
      name: model.client.name,
    };
  }
  if (
    model.clientId != null &&
    model.clientDocument != null &&
    model.clientName != null
  ) {
    return {
      id: model.clientId,
      document: DocumentVO.parse(model.clientDocument),
      name: model.clientName,
    };
  }
  throw new Error('Invalid service order document: missing client snapshot');
}

function resolveVehicleSnapshot(
  model: ServiceOrderModel & LegacyServiceOrderFlat,
): ServiceOrderProps['vehicle'] {
  if (model.vehicle?.id != null && model.vehicle.plate != null) {
    return {
      id: model.vehicle.id,
      plate: PlateVO.parse(model.vehicle.plate),
      brand: model.vehicle.brand,
      model: model.vehicle.model,
      year: model.vehicle.year,
    };
  }
  if (
    model.vehicleId != null &&
    model.vehiclePlate != null &&
    model.vehicleBrand != null &&
    model.vehicleModel != null &&
    model.vehicleYear != null
  ) {
    return {
      id: model.vehicleId,
      plate: PlateVO.parse(model.vehiclePlate),
      brand: model.vehicleBrand,
      model: model.vehicleModel,
      year: model.vehicleYear,
    };
  }
  throw new Error('Invalid service order document: missing vehicle snapshot');
}

export function modelToEntity(model: ServiceOrderModel): ServiceOrder {
  const m = model as ServiceOrderModel & LegacyServiceOrderFlat;
  const props: ServiceOrderProps = {
    status: m.status,
    client: resolveClientSnapshot(m),
    vehicle: resolveVehicleSnapshot(m),
    requestedServicesDescription: m.requestedServicesDescription,
    diagnosis: m.diagnosis,
    serviceLines: (m.serviceLines ?? []).map((l) => ({
      id: l.id,
      catalogServiceId: l.catalogServiceId,
      name: l.name,
      unitPrice: Money.parse(l.unitPrice),
      quantity: l.quantity,
      defaultParts: (l.defaultParts ?? []).map((p) => ({
        productCode: p.productCode,
        name: p.name,
        quantity: p.quantity,
      })),
    })),
    partLines: (m.partLines ?? []).map((p) => ({
      id: p.id,
      productCode: p.productCode,
      name: p.name,
      quantity: p.quantity,
    })),
    budget: m.budget
      ? {
          items: m.budget.items.map((i) => mapBudgetItem(i)),
          servicesTotal: m.budget.servicesTotal,
          partsTotal: m.budget.partsTotal,
          total: m.budget.total,
          approved: Boolean(m.budget.approved),
          approvedAt: m.budget.approvedAt,
        }
      : undefined,
    statusHistory: (m.statusHistory ?? []).map((h) => ({
      from: h.from,
      to: h.to,
      at: h.at,
    })),
    createdAt: m.createdAt ?? new Date(),
    updatedAt: m.updatedAt ?? new Date(),
    startedAt: m.startedAt,
    finishedAt: m.finishedAt,
    deliveredAt: m.deliveredAt,
    cancellationReason: m.cancellationReason,
  };
  const id = typeof m._id === 'string' ? m._id : String(m._id);
  return ServiceOrder.restore(props, id);
}

export function hydrateServiceOrderDoc(doc: unknown): ServiceOrder {
  if (doc == null || typeof doc !== 'object') {
    throw new Error('Expected service order document');
  }
  const maybeJson = doc as { toJSON?: () => ServiceOrderModel };
  const plain =
    typeof maybeJson.toJSON === 'function' ? maybeJson.toJSON() : doc;
  return modelToEntity(plain as ServiceOrderModel);
}
