import { Inject, Injectable } from '@nestjs/common';
import {
  BusinessRuleViolationError,
  EntityNotFoundError,
} from '../../../../shared/domain/errors';
import type { CatalogServiceRepositoryInterface } from '../../../domain/repositories/catalog-service.repository';
import type { ServiceOrderRepositoryInterface } from '../../../domain/repositories/service-order.repository';
import {
  CATALOG_SERVICE_REPOSITORY,
  SERVICE_ORDER_REPOSITORY,
} from '../../../domain/repositories/tokens';
import {
  PRODUCT_LOOKUP,
  type ProductLookupPort,
} from '../../../domain/services/product-lookup.port';
import { ServiceOrder } from '../../../domain/entities/service-order';

@Injectable()
export class AddServiceToOrderUseCase {
  constructor(
    @Inject(SERVICE_ORDER_REPOSITORY)
    private readonly orderRepo: ServiceOrderRepositoryInterface,
    @Inject(CATALOG_SERVICE_REPOSITORY)
    private readonly catalogRepo: CatalogServiceRepositoryInterface,
    @Inject(PRODUCT_LOOKUP)
    private readonly productLookup: ProductLookupPort,
  ) {}

  async execute(
    orderId: string,
    catalogServiceId: string,
    quantity = 1,
  ): Promise<ServiceOrder> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) throw new EntityNotFoundError('Service order not found');

    const catalog = await this.catalogRepo.findById(catalogServiceId);
    if (!catalog) throw new EntityNotFoundError('Catalog service not found');
    if (!catalog.active) {
      throw new BusinessRuleViolationError(
        'Cannot add an inactive catalog service to an order',
      );
    }

    const defaultParts: {
      productCode: string;
      name: string;
      quantity: number;
    }[] = [];
    for (const p of catalog.defaultParts ?? []) {
      const product = await this.productLookup.findByCodeOrNull(p.productCode);
      defaultParts.push({
        productCode: p.productCode,
        name: product?.name ?? p.productCode,
        quantity: p.quantity,
      });
    }

    try {
      order.addServiceLine({
        catalogServiceId: catalog.id,
        name: catalog.name,
        unitPrice: catalog.basePrice,
        quantity,
        defaultParts,
      });
    } catch (e) {
      throw new BusinessRuleViolationError(
        e instanceof Error ? e.message : 'Invalid operation',
      );
    }

    const saved = await this.orderRepo.save(order);
    return saved!;
  }
}
