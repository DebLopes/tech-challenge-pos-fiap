import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  Budget,
  BudgetItem,
} from '../../../domain/entities/service-order';
import { ServiceOrder } from '../../../domain/entities/service-order';
import { ServiceOrderStatus } from '../../../domain/entities/service-order-status';
import type { ServiceOrderRepositoryInterface } from '../../../domain/repositories/service-order.repository';
import type { ClientRepositoryInterface } from '../../../../identidade/domain/repositories/client.repository';
import { SERVICE_ORDER_REPOSITORY } from '../../../domain/repositories/tokens';
import { CLIENT_REPOSITORY } from '../../../../identidade/domain/repositories/tokens';
import {
  BUDGET_DELIVERY_NOTIFIER,
  type BudgetDeliveryNotifier,
} from '../../../domain/services/budget-delivery-notifier.port';
import {
  STOCK_SERVICE,
  type StockServicePort,
} from '../../../../shared/domain/services/stock-service.port';

@Injectable()
export class GenerateBudgetUseCase {
  constructor(
    @Inject(SERVICE_ORDER_REPOSITORY)
    private readonly orderRepo: ServiceOrderRepositoryInterface,
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepo: ClientRepositoryInterface,
    @Inject(BUDGET_DELIVERY_NOTIFIER)
    private readonly budgetDelivery: BudgetDeliveryNotifier,
    @Inject(STOCK_SERVICE)
    private readonly stock: StockServicePort,
  ) {}

  async execute(id: string): Promise<ServiceOrder> {
    const order = await this.orderRepo.findById(id);
    if (!order) throw new NotFoundException('Service order not found');

    if (!order.diagnosis?.trim()) {
      throw new BadRequestException(
        'Registre o diagnóstico antes de gerar o orçamento',
      );
    }

    if (order.serviceLines.length + order.partLines.length === 0) {
      throw new BadRequestException(
        'Cannot generate budget without service or part lines',
      );
    }

    const items: BudgetItem[] = [];
    let servicesTotal = 0;
    for (const line of order.serviceLines) {
      const total = line.unitPrice * line.quantity;
      servicesTotal += total;
      items.push({
        type: 'SERVICE',
        referenceId: line.catalogServiceId,
        description: line.name,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        total,
      });
    }

    const partDemand = order.aggregatePartDemand();
    const quote = await this.stock.quoteFifoCost(
      Array.from(partDemand.entries()).map(([productCode, required]) => ({
        productCode,
        required,
      })),
    );
    const quoteByCode = new Map(quote.map((q) => [q.productCode, q]));
    const nameByCode = new Map<string, string>();
    for (const sl of order.serviceLines) {
      for (const dp of sl.defaultParts) {
        if (dp.name?.trim() && !nameByCode.has(dp.productCode)) {
          nameByCode.set(dp.productCode, dp.name);
        }
      }
    }
    for (const pl of order.partLines) {
      if (pl.name?.trim()) {
        nameByCode.set(pl.productCode, pl.name);
      }
    }
    let partsTotal = 0;
    for (const [productCode, quantity] of partDemand.entries()) {
      const q = quoteByCode.get(productCode);
      const totalCost = q?.totalCost ?? 0;
      const unitPrice = q?.unitPrice ?? 0;
      partsTotal += totalCost;
      items.push({
        type: 'PART',
        referenceId: productCode,
        description: nameByCode.get(productCode) ?? productCode,
        quantity,
        unitPrice: Number.isFinite(unitPrice) ? unitPrice : 0,
        total: totalCost,
      });
    }

    const budget: Budget = {
      items,
      servicesTotal,
      partsTotal,
      total: servicesTotal + partsTotal,
      approved: false,
    };

    const statusBeforeApply = order.status;

    try {
      order.applyBudget(budget);
    } catch (e) {
      throw new BadRequestException(
        e instanceof Error ? e.message : 'Invalid operation',
      );
    }

    const saved = await this.orderRepo.save(order);

    const becameWaitingApproval =
      statusBeforeApply !== ServiceOrderStatus.WAITING_APPROVAL;
    if (saved?.budget && becameWaitingApproval) {
      const client = await this.clientRepo.findById(saved.clientId);
      if (!client) {
        throw new NotFoundException(`Client "${saved.clientId}" not found`);
      }
      await this.budgetDelivery.notifyBudgetReady({
        serviceOrderId: saved.id,
        clientDocument: saved.clientDocument,
        clientName: saved.clientName,
        clientEmail: client.email,
        vehiclePlate: saved.vehiclePlate,
        vehicleBrand: saved.vehicleBrand,
        vehicleModel: saved.vehicleModel,
        vehicleYear: saved.vehicleYear,
        budget: saved.budget,
      });
    }
    return saved!;
  }
}
