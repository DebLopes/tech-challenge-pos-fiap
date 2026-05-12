import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ProductRepositoryInterface } from '../../../domain/repositories/product.repository';
import type { ServiceOrderRepositoryInterface } from '../../../domain/repositories/service-order.repository';
import {
  PRODUCT_REPOSITORY,
  SERVICE_ORDER_REPOSITORY,
} from '../../../domain/repositories/tokens';
import { ServiceOrder } from '../../../domain/entities/service-order';

@Injectable()
export class AddPartToOrderUseCase {
  constructor(
    @Inject(SERVICE_ORDER_REPOSITORY)
    private readonly orderRepo: ServiceOrderRepositoryInterface,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepo: ProductRepositoryInterface,
  ) {}

  async execute(
    orderId: string,
    productCode: string,
    quantity: number,
  ): Promise<ServiceOrder> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) throw new NotFoundException('Service order not found');

    const code = productCode.trim().toUpperCase();
    const product = await this.productRepo.findByCodeOrNull(code);
    if (!product) {
      throw new NotFoundException(`Product "${code}" not found`);
    }

    try {
      order.addPartLine({
        productCode: code,
        name: product.name,
        quantity,
      });
    } catch (e) {
      throw new BadRequestException(
        e instanceof Error ? e.message : 'Invalid operation',
      );
    }

    const saved = await this.orderRepo.save(order);
    return saved!;
  }
}
