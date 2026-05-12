import type {
  Budget,
  BudgetItem,
  ServiceLineDefaultPart,
  ServiceOrderPartLine,
  ServiceOrderServiceLine,
  StatusHistoryEntry,
} from '../../../../domain/entities/service-order';
import { BudgetItemResponseDto } from '../dtos/budget-item-response.dto';
import { BudgetResponseDto } from '../dtos/budget-response.dto';
import { ServiceLineDefaultPartResponseDto } from '../dtos/service-line-default-part-response.dto';
import { ServiceOrderPartLineResponseDto } from '../dtos/service-order-part-line-response.dto';
import { ServiceOrderServiceLineResponseDto } from '../dtos/service-order-service-line-response.dto';
import { StatusHistoryEntryResponseDto } from '../dtos/status-history-entry-response.dto';

export const ServiceLineDefaultPartConverter = {
  toDto(part: ServiceLineDefaultPart): ServiceLineDefaultPartResponseDto {
    return Object.assign(new ServiceLineDefaultPartResponseDto(), {
      productCode: part.productCode,
      name: part.name,
      quantity: part.quantity,
    });
  },
};

export const ServiceOrderPartLineConverter = {
  toDto(line: ServiceOrderPartLine): ServiceOrderPartLineResponseDto {
    return Object.assign(new ServiceOrderPartLineResponseDto(), {
      id: line.id,
      productCode: line.productCode,
      name: line.name,
      quantity: line.quantity,
    });
  },
};

export const BudgetItemConverter = {
  toDto(item: BudgetItem): BudgetItemResponseDto {
    return Object.assign(new BudgetItemResponseDto(), {
      type: item.type,
      referenceId: item.referenceId,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total,
    });
  },
};

export const BudgetConverter = {
  toDto(budget: Budget): BudgetResponseDto {
    return Object.assign(new BudgetResponseDto(), {
      items: budget.items.map((i) => BudgetItemConverter.toDto(i)),
      servicesTotal: budget.servicesTotal,
      partsTotal: budget.partsTotal,
      total: budget.total,
      approved: budget.approved,
      approvedAt: budget.approvedAt,
    });
  },
};

export const ServiceOrderServiceLineConverter = {
  toDto(line: ServiceOrderServiceLine): ServiceOrderServiceLineResponseDto {
    return Object.assign(new ServiceOrderServiceLineResponseDto(), {
      id: line.id,
      catalogServiceId: line.catalogServiceId,
      name: line.name,
      unitPrice: line.unitPrice,
      quantity: line.quantity,
      defaultParts: line.defaultParts.map((p) =>
        ServiceLineDefaultPartConverter.toDto(p),
      ),
    });
  },
};

export const StatusHistoryEntryConverter = {
  toDto(entry: StatusHistoryEntry): StatusHistoryEntryResponseDto {
    return Object.assign(new StatusHistoryEntryResponseDto(), {
      from: entry.from,
      to: entry.to,
      at: entry.at,
    });
  },
};
