import { Inject, Injectable } from '@nestjs/common';
import type { ServiceOrderRepositoryInterface } from '../../../domain/repositories/service-order.repository';
import { SERVICE_ORDER_REPOSITORY } from '../../../domain/repositories/tokens';
import type { AverageExecutionTimeResult } from './average-execution-time.result';

function minutesBetween(startedAt: Date, finishedAt: Date): number {
  return (finishedAt.getTime() - startedAt.getTime()) / 60000;
}

function roundMinutes(value: number): number {
  return Math.round(value * 100) / 100;
}

@Injectable()
export class GetAverageExecutionTimeUseCase {
  constructor(
    @Inject(SERVICE_ORDER_REPOSITORY)
    private readonly orderRepo: ServiceOrderRepositoryInterface,
  ) {}

  async execute(): Promise<AverageExecutionTimeResult> {
    const list = await this.orderRepo.findFinished();
    const valid = list.filter((m) => m.startedAt && m.finishedAt);
    if (valid.length === 0) {
      return { averageMinutes: 0, sampleSize: 0, items: [] };
    }
    const items = valid
      .map((m) => {
        const startedAt = new Date(m.startedAt!);
        const finishedAt = new Date(m.finishedAt!);
        const raw = minutesBetween(startedAt, finishedAt);
        return {
          serviceOrderId: m.id,
          executionMinutes: roundMinutes(raw),
          startedAt,
          finishedAt,
          vehiclePlate: m.vehiclePlate,
        };
      })
      .sort((a, b) => a.serviceOrderId.localeCompare(b.serviceOrderId));

    const totalMinutes = valid.reduce((sum, m) => {
      return (
        sum + minutesBetween(new Date(m.startedAt!), new Date(m.finishedAt!))
      );
    }, 0);

    return {
      averageMinutes: roundMinutes(totalMinutes / valid.length),
      sampleSize: valid.length,
      items,
    };
  }
}
