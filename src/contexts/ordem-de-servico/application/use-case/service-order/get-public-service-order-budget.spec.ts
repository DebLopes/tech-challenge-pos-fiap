import { describe, expect, it } from '@jest/globals';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ServiceOrder } from '../../../domain/entities/service-order';
import { ServiceOrderStatus } from '../../../domain/entities/service-order-status';
import type { ServiceOrderRepositoryInterface } from '../../../domain/repositories/service-order.repository';
import { DocumentVO } from '../../../../identidade/domain/value-objects/document.vo';
import { PlateVO } from '../../../../identidade/domain/value-objects/plate.vo';
import { GetPublicServiceOrderBudgetUseCase } from './get-public-service-order-budget';

class StubOrderRepo implements ServiceOrderRepositoryInterface {
  constructor(private readonly orderReturn: ServiceOrder | null) {}

  create(): Promise<ServiceOrder> {
    throw new Error('not used');
  }
  find(): Promise<ServiceOrder[]> {
    throw new Error('not used');
  }
  findById(id: string): Promise<ServiceOrder | null> {
    if (!this.orderReturn || this.orderReturn.id !== id)
      return Promise.resolve(null);
    return Promise.resolve(this.orderReturn);
  }
  findOpenByDocument(): Promise<ServiceOrder[]> {
    throw new Error('not used');
  }
  findFinished(): Promise<ServiceOrder[]> {
    throw new Error('not used');
  }
  save(): Promise<ServiceOrder | null> {
    throw new Error('not used');
  }
}

const baseOrder = (): ServiceOrder => {
  const now = new Date();
  return ServiceOrder.restore(
    {
      status: ServiceOrderStatus.WAITING_APPROVAL,
      client: {
        id: 'c1',
        document: DocumentVO.parse('87075443089'),
        name: 'Maria',
      },
      vehicle: {
        id: 'v1',
        plate: PlateVO.parse('MVO9884'),
        brand: 'Fiat',
        model: 'Uno',
        year: 2015,
      },
      serviceLines: [],
      partLines: [],
      statusHistory: [],
      createdAt: now,
      updatedAt: now,
      budget: {
        items: [
          {
            type: 'SERVICE',
            referenceId: 'svc-1',
            description: 'Troca de óleo',
            quantity: 1,
            unitPrice: 120,
            total: 120,
          },
        ],
        servicesTotal: 120,
        partsTotal: 0,
        total: 120,
        approved: false,
      },
    },
    'os-1',
  );
};

const orderWithoutBudget = (): ServiceOrder => {
  const now = new Date();
  return ServiceOrder.restore(
    {
      status: ServiceOrderStatus.WAITING_APPROVAL,
      client: {
        id: 'c1',
        document: DocumentVO.parse('87075443089'),
        name: 'Maria',
      },
      vehicle: {
        id: 'v1',
        plate: PlateVO.parse('MVO9884'),
        brand: 'Fiat',
        model: 'Uno',
        year: 2015,
      },
      serviceLines: [],
      partLines: [],
      statusHistory: [],
      createdAt: now,
      updatedAt: now,
      budget: undefined,
    },
    'os-1',
  );
};

describe('GetPublicServiceOrderBudgetUseCase', () => {
  it('retorna o orçamento quando documento e id conferem', async () => {
    const uc = new GetPublicServiceOrderBudgetUseCase(
      new StubOrderRepo(baseOrder()),
    );
    const dto = await uc.execute('os-1', '87075443089');
    expect(dto.total).toBe(120);
    expect(dto.items).toHaveLength(1);
    expect(dto.approved).toBe(false);
  });

  it('aceita documento só com dígitos equivalente ao cadastro', async () => {
    const uc = new GetPublicServiceOrderBudgetUseCase(
      new StubOrderRepo(baseOrder()),
    );
    const dto = await uc.execute('os-1', '870.754.430-89');
    expect(dto.total).toBe(120);
  });

  it('exige document', async () => {
    const uc = new GetPublicServiceOrderBudgetUseCase(
      new StubOrderRepo(baseOrder()),
    );
    await expect(uc.execute('os-1', '   ')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('404 quando OS não existe', async () => {
    const uc = new GetPublicServiceOrderBudgetUseCase(
      new StubOrderRepo(baseOrder()),
    );
    await expect(uc.execute('outro-id', '87075443089')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('404 quando documento não é do cliente', async () => {
    const uc = new GetPublicServiceOrderBudgetUseCase(
      new StubOrderRepo(baseOrder()),
    );
    await expect(uc.execute('os-1', '11111111111')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('404 quando placa informada não confere', async () => {
    const uc = new GetPublicServiceOrderBudgetUseCase(
      new StubOrderRepo(baseOrder()),
    );
    await expect(
      uc.execute('os-1', '87075443089', 'ABC1D23'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('404 quando não há orçamento gerado', async () => {
    const uc = new GetPublicServiceOrderBudgetUseCase(
      new StubOrderRepo(orderWithoutBudget()),
    );
    await expect(uc.execute('os-1', '87075443089')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
