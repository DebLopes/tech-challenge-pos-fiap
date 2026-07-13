import { describe, expect, it } from '@jest/globals';
import { Money } from '../../../shared/domain/value-objects/money.vo';
import { DocumentVO } from '../../../identidade/domain/value-objects/document.vo';
import { PlateVO } from '../../../identidade/domain/value-objects/plate.vo';
import { ServiceOrder, type Budget } from './service-order';
import { ServiceOrderStatus } from './service-order-status';

function newOrder(id = 'os-1') {
  return ServiceOrder.create(
    {
      client: {
        id: 'c1',
        document: '529.982.247-25',
        name: 'Maria',
      },
      vehicle: {
        id: 'v1',
        plate: 'APL-1234',
        brand: 'Fiat',
        model: 'Uno',
        year: 2015,
      },
      requestedServicesDescription: 'Revisão',
    },
    id,
  );
}

describe('ServiceOrder (domínio)', () => {
  it('starts as RECEIVED with status history', () => {
    const so = newOrder();
    expect(so.status).toBe(ServiceOrderStatus.RECEIVED);
    expect(so.clientId).toBe('c1');
    expect(so.clientDocument).toBe('52998224725');
    expect(so.clientName).toBe('Maria');
    expect(so.vehicleId).toBe('v1');
    expect(so.vehiclePlate).toBe('APL1234');
    expect(so.vehicleBrand).toBe('Fiat');
    expect(so.vehicleModel).toBe('Uno');
    expect(so.vehicleYear).toBe(2015);
    expect(so.requestedServicesDescription).toBe('Revisão');
    expect(so.isInExecution()).toBe(false);
    expect(so.statusHistory).toHaveLength(1);
    expect(so.statusHistory[0].to).toBe(ServiceOrderStatus.RECEIVED);
  });

  it('create with initial service and part lines stays RECEIVED', () => {
    const so = ServiceOrder.create({
      client: {
        id: 'c1',
        document: '529.982.247-25',
        name: 'Maria',
      },
      vehicle: {
        id: 'v1',
        plate: 'APL-1234',
        brand: 'Fiat',
        model: 'Uno',
        year: 2015,
      },
      serviceLines: [
        {
          catalogServiceId: 'cs-1',
          name: 'Troca óleo',
          unitPrice: 80,
          quantity: 1,
          defaultParts: [{ productCode: 'P1', name: 'Óleo', quantity: 1 }],
        },
      ],
      partLines: [{ productCode: 'P2', name: 'Filtro', quantity: 2 }],
    });

    expect(so.status).toBe(ServiceOrderStatus.RECEIVED);
    expect(so.statusHistory).toHaveLength(1);
    expect(so.serviceLines).toHaveLength(1);
    expect(so.partLines).toHaveLength(1);
    expect(so.partLines[0].productCode).toBe('P2');
  });

  it('registerDiagnosis trims and transitions to IN_DIAGNOSIS', () => {
    const so = newOrder();
    so.registerDiagnosis('  ok  ');
    expect(so.status).toBe(ServiceOrderStatus.IN_DIAGNOSIS);
    expect(so.diagnosis).toBe('ok');
  });

  it('registerDiagnosis rejects empty and invalid status', () => {
    const so = newOrder();
    expect(() => so.registerDiagnosis('   ')).toThrow(
      'Diagnosis must not be empty',
    );

    const restored = ServiceOrder.restore(
      {
        status: ServiceOrderStatus.FINISHED,
        client: {
          id: 'c1',
          document: DocumentVO.parse('52998224725'),
          name: 'Maria',
        },
        vehicle: {
          id: 'v1',
          plate: PlateVO.parse('APL1234'),
          brand: 'Fiat',
          model: 'Uno',
          year: 2015,
        },
        serviceLines: [],
        partLines: [],
        budget: undefined,
        statusHistory: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      'os-finished',
    );
    expect(() => restored.registerDiagnosis('x')).toThrow(
      /Cannot register diagnosis/,
    );
  });

  it('adds service and part lines, uppercasing product codes in defaultParts and part lines', () => {
    const so = newOrder();
    so.registerDiagnosis('diag');

    expect(() =>
      so.addServiceLine({
        catalogServiceId: 'cs-1',
        name: '   ',
        unitPrice: 10,
        quantity: 1,
        defaultParts: [],
      }),
    ).toThrow('Service line name is required');
    expect(() =>
      so.addServiceLine({
        catalogServiceId: 'cs-1',
        name: 'Ok',
        unitPrice: 10,
        quantity: 0,
        defaultParts: [],
      }),
    ).toThrow('Service line quantity must be > 0');

    const svc = so.addServiceLine({
      catalogServiceId: 'cs-1',
      name: ' Troca óleo ',
      unitPrice: Money.parse(10).value,
      quantity: 2,
      defaultParts: [
        { productCode: 'demo-filter-01', name: 'Filtro', quantity: 1 },
      ],
    });
    expect(svc.name).toBe('Troca óleo');
    expect(svc.defaultParts[0].productCode).toBe('DEMO-FILTER-01');

    expect(() =>
      so.addPartLine({ productCode: 'P0', name: 'Peça', quantity: 0 }),
    ).toThrow('Part line quantity must be > 0');
    expect(() =>
      so.addPartLine({ productCode: '   ', name: 'Peça', quantity: 1 }),
    ).toThrow('Part line productCode is required');

    const part = so.addPartLine({
      productCode: 'p-01',
      name: 'Peça',
      quantity: 3,
    });
    expect(part.productCode).toBe('P-01');

    const demand = so.aggregatePartDemand();
    expect(demand.get('DEMO-FILTER-01')).toBe(2);
    expect(demand.get('P-01')).toBe(3);
  });

  it('applyBudget requires at least one line and sets WAITING_APPROVAL', () => {
    const so = newOrder();
    expect(() =>
      so.applyBudget({
        items: [],
        servicesTotal: 0,
        partsTotal: 0,
        total: 0,
        approved: false,
      }),
    ).toThrow('Cannot generate budget without lines');

    so.registerDiagnosis('diag');
    so.addPartLine({ productCode: 'P1', name: 'Peça', quantity: 1 });

    const budget: Budget = {
      items: [
        {
          type: 'PART',
          referenceId: 'p1',
          description: 'Peça',
          quantity: 1,
          unitPrice: 10,
          total: 10,
        },
      ],
      servicesTotal: 0,
      partsTotal: 10,
      total: 10,
      approved: false,
    };
    so.applyBudget(budget);
    expect(so.status).toBe(ServiceOrderStatus.WAITING_APPROVAL);
    expect(so.budget?.approved).toBe(false);
  });

  it('approveBudget toggles approved and is idempotent', () => {
    const so = newOrder();
    expect(() => so.approveBudget()).toThrow(
      /Cannot approve budget when status/,
    );
    so.registerDiagnosis('diag');
    so.addPartLine({ productCode: 'P1', name: 'Peça', quantity: 1 });
    so.applyBudget({
      items: [],
      servicesTotal: 0,
      partsTotal: 0,
      total: 0,
      approved: false,
    });

    so.approveBudget();
    const approvedAt = so.budget?.approvedAt;
    expect(so.budget?.approved).toBe(true);
    expect(approvedAt).toBeInstanceOf(Date);

    so.approveBudget();
    expect(so.budget?.approved).toBe(true);
    expect(so.budget?.approvedAt).toBe(approvedAt);
  });

  it('startExecution/finish/deliver enforce state transitions', () => {
    const so = newOrder();
    expect(() => so.startExecution()).toThrow(/Cannot start execution/);
    expect(() => so.finish()).toThrow(/Cannot finish service order/);

    so.registerDiagnosis('diag');
    so.addPartLine({ productCode: 'P1', name: 'Peça', quantity: 1 });
    so.applyBudget({
      items: [],
      servicesTotal: 0,
      partsTotal: 0,
      total: 0,
      approved: false,
    });
    expect(() => so.startExecution()).toThrow(
      'Cannot start execution without an approved budget',
    );

    so.approveBudget();
    so.startExecution();
    expect(so.status).toBe(ServiceOrderStatus.IN_EXECUTION);
    expect(so.startedAt).toBeInstanceOf(Date);
    expect(so.isInExecution()).toBe(true);

    expect(() => so.deliver()).toThrow(/Cannot deliver/);
    so.finish();
    expect(so.status).toBe(ServiceOrderStatus.FINISHED);
    expect(so.finishedAt).toBeInstanceOf(Date);

    so.deliver();
    expect(so.status).toBe(ServiceOrderStatus.DELIVERED);
    expect(so.deliveredAt).toBeInstanceOf(Date);
  });

  it('rejectBudget cancels and clears budget', () => {
    const so = newOrder();
    so.registerDiagnosis('diag');
    so.addPartLine({ productCode: 'P1', name: 'Peça', quantity: 1 });
    so.applyBudget({
      items: [],
      servicesTotal: 0,
      partsTotal: 0,
      total: 0,
      approved: false,
    });

    so.rejectBudget();
    expect(so.status).toBe(ServiceOrderStatus.CANCELLED);
    expect(so.budget).toBeUndefined();
    expect(so.cancellationReason).toBe('Orçamento reprovado pelo cliente');
  });

  it('rejectBudget validates status and budget rules', () => {
    const so = newOrder();
    expect(() => so.rejectBudget('x')).toThrow(
      /Cannot reject budget when status/,
    );

    so.registerDiagnosis('diag');
    so.addPartLine({ productCode: 'P1', name: 'Peça', quantity: 1 });
    so.applyBudget({
      items: [],
      servicesTotal: 0,
      partsTotal: 0,
      total: 0,
      approved: false,
    });

    so.approveBudget();
    expect(() => so.rejectBudget(' motivo ')).toThrow(
      'Cannot reject an approved budget',
    );
  });

  it('addServiceLine on RECEIVED auto-transitions to IN_DIAGNOSIS', () => {
    const so = newOrder();
    expect(so.status).toBe(ServiceOrderStatus.RECEIVED);
    so.addServiceLine({
      catalogServiceId: 'cs-1',
      name: 'Troca óleo',
      unitPrice: 10,
      quantity: 1,
      defaultParts: [],
    });
    expect(so.status).toBe(ServiceOrderStatus.IN_DIAGNOSIS);
    expect(
      so.statusHistory.some(
        (h) =>
          h.from === ServiceOrderStatus.RECEIVED &&
          h.to === ServiceOrderStatus.IN_DIAGNOSIS,
      ),
    ).toBe(true);
  });

  it('addPartLine on RECEIVED auto-transitions to IN_DIAGNOSIS', () => {
    const so = newOrder();
    expect(so.status).toBe(ServiceOrderStatus.RECEIVED);
    so.addPartLine({ productCode: 'P1', name: 'Peça', quantity: 1 });
    expect(so.status).toBe(ServiceOrderStatus.IN_DIAGNOSIS);
  });

  it('addPartLine on IN_DIAGNOSIS keeps status unchanged', () => {
    const so = newOrder();
    so.registerDiagnosis('diag');
    const historyLengthBefore = so.statusHistory.length;
    so.addPartLine({ productCode: 'P1', name: 'Peça', quantity: 1 });
    expect(so.status).toBe(ServiceOrderStatus.IN_DIAGNOSIS);
    expect(so.statusHistory).toHaveLength(historyLengthBefore);
  });

  it('editing a WAITING_APPROVAL order with existing budget invalidates budget and returns to IN_DIAGNOSIS', () => {
    const so = newOrder();
    so.registerDiagnosis('diag');
    so.addPartLine({ productCode: 'P1', name: 'Peça', quantity: 1 });
    so.applyBudget({
      items: [],
      servicesTotal: 0,
      partsTotal: 0,
      total: 0,
      approved: false,
    });
    expect(so.status).toBe(ServiceOrderStatus.WAITING_APPROVAL);
    expect(so.budget).toBeDefined();

    so.addPartLine({ productCode: 'P2', name: 'Outra', quantity: 1 });
    expect(so.budget).toBeUndefined();
    expect(so.status).toBe(ServiceOrderStatus.IN_DIAGNOSIS);

    const json = so.toJSON();
    expect(json.id).toBe('os-1');
    expect(json.client.document).toBe('52998224725');
    expect(Array.isArray(json.partLines)).toBe(true);
  });
});
