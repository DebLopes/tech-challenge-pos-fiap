import { describe, expect, it } from '@jest/globals';
import { ServiceOrder } from '../../../domain/entities/service-order';
import { ServiceOrderStatus } from '../../../domain/entities/service-order-status';
import type { ServiceOrderRepositoryInterface } from '../../../domain/repositories/service-order.repository';
import { DocumentVO } from '../../../../identidade/domain/value-objects/document.vo';
import { PlateVO } from '../../../../identidade/domain/value-objects/plate.vo';
import { Money } from '../../../../shared/domain/value-objects/money.vo';
import { GetAverageExecutionTimeUseCase } from './get-average-execution-time';

const now = new Date('2026-05-01T12:00:00.000Z');

function restoreFinishedOrder(
  id: string,
  plate: string,
  startedAt: Date,
  finishedAt: Date,
): ServiceOrder {
  return ServiceOrder.restore(
    {
      status: ServiceOrderStatus.FINISHED,
      client: {
        id: 'client-1',
        document: DocumentVO.parse('52998224725'),
        name: 'Cliente',
      },
      vehicle: {
        id: 'vehicle-1',
        plate: PlateVO.parse(plate),
        brand: 'Brand',
        model: 'Model',
        year: 2020,
      },
      serviceLines: [
        {
          id: 'sl-1',
          catalogServiceId: 'cs-1',
          name: 'Servico',
          unitPrice: Money.parse(10),
          quantity: 1,
          defaultParts: [],
        },
      ],
      partLines: [],
      budget: undefined,
      statusHistory: [],
      createdAt: now,
      updatedAt: now,
      startedAt,
      finishedAt,
    },
    id,
  );
}

function repoWith(orders: ServiceOrder[]): ServiceOrderRepositoryInterface {
  return {
    findFinished: async () => orders,
  } as ServiceOrderRepositoryInterface;
}

describe('GetAverageExecutionTimeUseCase', () => {
  it('returns zeros and empty items when there is no finished sample', async () => {
    const uc = new GetAverageExecutionTimeUseCase(repoWith([]));
    const r = await uc.execute();
    expect(r).toEqual({
      averageMinutes: 0,
      sampleSize: 0,
      items: [],
    });
  });

  it('ignores orders missing startedAt or finishedAt', async () => {
    const incomplete = ServiceOrder.restore(
      {
        status: ServiceOrderStatus.FINISHED,
        client: {
          id: 'client-1',
          document: DocumentVO.parse('52998224725'),
          name: 'Cliente',
        },
        vehicle: {
          id: 'vehicle-1',
          plate: PlateVO.parse('ABC1D23'),
          brand: 'Brand',
          model: 'Model',
          year: 2020,
        },
        serviceLines: [],
        partLines: [],
        budget: undefined,
        statusHistory: [],
        createdAt: now,
        updatedAt: now,
        startedAt: new Date('2026-05-01T10:00:00.000Z'),
      },
      'only-started',
    );
    const uc = new GetAverageExecutionTimeUseCase(repoWith([incomplete]));
    const r = await uc.execute();
    expect(r.sampleSize).toBe(0);
    expect(r.items).toHaveLength(0);
  });

  it('computes rounded average and per-order breakdown sorted by id', async () => {
    const a = restoreFinishedOrder(
      'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb',
      'AAA1A11',
      new Date('2026-05-01T10:00:00.000Z'),
      new Date('2026-05-01T10:10:00.000Z'),
    );
    const b = restoreFinishedOrder(
      'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',
      'BBB1B22',
      new Date('2026-05-01T08:00:00.000Z'),
      new Date('2026-05-01T08:20:00.000Z'),
    );
    const uc = new GetAverageExecutionTimeUseCase(repoWith([a, b]));
    const r = await uc.execute();
    expect(r.sampleSize).toBe(2);
    expect(r.averageMinutes).toBe(15);
    expect(r.items).toHaveLength(2);
    expect(r.items[0].serviceOrderId).toBe(
      'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',
    );
    expect(r.items[0].executionMinutes).toBe(20);
    expect(r.items[0].vehiclePlate).toBe('BBB1B22');
    expect(r.items[1].serviceOrderId).toBe(
      'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb',
    );
    expect(r.items[1].executionMinutes).toBe(10);
  });

  it('rounds fractional minutes to two decimals', async () => {
    const started = new Date('2026-05-01T10:00:00.000Z');
    const finished = new Date(started.getTime() + 90_027);
    const one = restoreFinishedOrder(
      'cccccccc-cccc-4ccc-cccc-cccccccccccc',
      'XYZ9Z99',
      started,
      finished,
    );
    const uc = new GetAverageExecutionTimeUseCase(repoWith([one]));
    const r = await uc.execute();
    expect(r.sampleSize).toBe(1);
    expect(r.averageMinutes).toBe(1.5);
    expect(r.items[0].executionMinutes).toBe(1.5);
  });
});
