import { Inject, Injectable } from '@nestjs/common';
import {
  BusinessRuleViolationError,
  EntityNotFoundError,
} from '../../../../shared/domain/errors';
import type { ServiceOrderRepositoryInterface } from '../../../domain/repositories/service-order.repository';
import { SERVICE_ORDER_REPOSITORY } from '../../../domain/repositories/tokens';
import {
  PRODUCT_LOOKUP,
  type ProductLookupPort,
} from '../../../domain/ports/product-lookup.port';
import { ServiceOrder } from '../../../domain/entities/service-order';

@Injectable()
export class AddPartToOrderUseCase {
  constructor(
    @Inject(SERVICE_ORDER_REPOSITORY)
    private readonly orderRepo: ServiceOrderRepositoryInterface,
    @Inject(PRODUCT_LOOKUP)
    private readonly productLookup: ProductLookupPort,
  ) {}

  async execute(
    orderId: string,
    productCode: string,
    quantity: number,
  ): Promise<ServiceOrder> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) throw new EntityNotFoundError('Service order not found');

    const code = productCode.trim().toUpperCase();
    const product = await this.productLookup.findByCodeOrNull(code);
    if (!product) {
      throw new EntityNotFoundError(`Product "${code}" not found`);
    }

    try {
      order.addPartLine({
        productCode: code,
        name: product.name,
        quantity,
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
