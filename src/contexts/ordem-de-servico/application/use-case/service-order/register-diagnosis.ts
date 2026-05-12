import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ServiceOrderRepositoryInterface } from '../../../domain/repositories/service-order.repository';
import { SERVICE_ORDER_REPOSITORY } from '../../../domain/repositories/tokens';
import { ServiceOrder } from '../../../domain/entities/service-order';

@Injectable()
export class RegisterDiagnosisUseCase {
  constructor(
    @Inject(SERVICE_ORDER_REPOSITORY)
    private readonly orderRepo: ServiceOrderRepositoryInterface,
  ) {}

  async execute(id: string, diagnosis: string): Promise<ServiceOrder> {
    const order = await this.orderRepo.findById(id);
    if (!order) throw new NotFoundException('Service order not found');

    try {
      order.registerDiagnosis(diagnosis);
    } catch (e) {
      throw new BadRequestException(
        e instanceof Error ? e.message : 'Invalid operation',
      );
    }
    const saved = await this.orderRepo.save(order);
    return saved!;
  }
}
