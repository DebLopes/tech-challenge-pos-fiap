import { describe, expect, it } from '@jest/globals';
import {
  BusinessRuleViolationError,
  ConflictError,
  EntityNotFoundError,
} from '../../../../shared/domain/errors';
import { CatalogService } from '../../../domain/entities/catalog-service';
import { ServiceOrderStatus } from '../../../domain/entities/service-order-status';
import { AddPartToOrderUseCase } from './add-part-to-order';
import { AddServiceToOrderUseCase } from './add-service-to-order';
import { ApproveBudgetUseCase } from './approve-budget';
import { CreateServiceOrderUseCase } from './create-service-order';
import { DeliverServiceOrderUseCase } from './deliver-service-order';
import { FinishServiceOrderUseCase } from './finish-service-order';
import { GenerateBudgetUseCase } from './generate-budget';
import { GetAllServiceOrdersUseCase } from './get-all-service-order';
import { GetServiceOrderUseCase } from './get-service-order';
import { OpenServiceOrderUseCase } from './open-service-order';
import { RegisterDiagnosisUseCase } from './register-diagnosis';
import { RejectBudgetUseCase } from './reject-budget';
import { STOCK_SHORTAGE_CODE } from './stock-shortage';
import {
  TEST_CATALOG_ID,
  TEST_CLIENT_ID,
  TEST_PRODUCT_CODE,
  TEST_VEHICLE_ID,
  createDiagnosedOrderWithService,
  createFinishedOrder,
  createInExecutionOrder,
  createReceivedOrder,
  createWaitingApprovalOrder,
  defaultCatalogService,
  defaultClientSnapshot,
  defaultProductSnapshot,
  defaultVehicleSnapshot,
  InMemoryCatalogServiceRepository,
  InMemoryClientLookup,
  InMemoryClientProvisioning,
  InMemoryProductLookup,
  InMemoryServiceOrderRepository,
  InMemoryStockService,
  InMemoryVehicleLookup,
  InMemoryVehicleProvisioning,
  restoreOrder,
  SpyBudgetDeliveryNotifier,
} from './__fakes__/service-order.fakes';

describe('Service order use cases', () => {
  describe('CreateServiceOrderUseCase', () => {
    it('cria OS quando cliente e veículo existem', async () => {
      const orderRepo = new InMemoryServiceOrderRepository();
      const clientLookup = new InMemoryClientLookup().seed(
        defaultClientSnapshot(),
      );
      const vehicleLookup = new InMemoryVehicleLookup().seed(
        defaultVehicleSnapshot(),
      );
      const uc = new CreateServiceOrderUseCase(
        orderRepo,
        clientLookup,
        vehicleLookup,
      );

      const order = await uc.execute({
        clientId: TEST_CLIENT_ID,
        vehicleId: TEST_VEHICLE_ID,
        requestedServicesDescription: 'Revisão geral',
      });

      expect(order.id).toBeTruthy();
      expect(order.status).toBe(ServiceOrderStatus.RECEIVED);
      expect(order.clientId).toBe(TEST_CLIENT_ID);
      expect(order.vehicleId).toBe(TEST_VEHICLE_ID);
      expect(order.requestedServicesDescription).toBe('Revisão geral');
    });

    it('retorna 404 quando cliente não existe', async () => {
      const uc = new CreateServiceOrderUseCase(
        new InMemoryServiceOrderRepository(),
        new InMemoryClientLookup(),
        new InMemoryVehicleLookup().seed(defaultVehicleSnapshot()),
      );

      await expect(
        uc.execute({ clientId: 'missing', vehicleId: TEST_VEHICLE_ID }),
      ).rejects.toBeInstanceOf(EntityNotFoundError);
    });

    it('retorna 404 quando veículo não existe', async () => {
      const uc = new CreateServiceOrderUseCase(
        new InMemoryServiceOrderRepository(),
        new InMemoryClientLookup().seed(defaultClientSnapshot()),
        new InMemoryVehicleLookup(),
      );

      await expect(
        uc.execute({ clientId: TEST_CLIENT_ID, vehicleId: 'missing' }),
      ).rejects.toBeInstanceOf(EntityNotFoundError);
    });
  });

  describe('OpenServiceOrderUseCase', () => {
    it('provisiona cliente/veículo e abre OS com serviços e peças', async () => {
      const orderRepo = new InMemoryServiceOrderRepository();
      const catalogRepo = new InMemoryCatalogServiceRepository().seed(
        defaultCatalogService(),
      );
      const productLookup = new InMemoryProductLookup().seed(
        defaultProductSnapshot(),
      );
      const uc = new OpenServiceOrderUseCase(
        new InMemoryClientProvisioning(),
        new InMemoryVehicleProvisioning(),
        orderRepo,
        catalogRepo,
        productLookup,
      );

      const order = await uc.execute({
        client: {
          name: 'Maria',
          document: '87075443089',
          email: 'maria@example.com',
        },
        vehicle: {
          plate: 'MVO9884',
          brand: 'Fiat',
          model: 'Uno',
          year: 2015,
        },
        requestedServicesDescription: 'Barulho no motor',
        services: [{ catalogServiceId: TEST_CATALOG_ID, quantity: 1 }],
        parts: [{ productCode: TEST_PRODUCT_CODE, quantity: 2 }],
      });

      expect(order.status).toBe(ServiceOrderStatus.RECEIVED);
      expect(order.serviceLines).toHaveLength(1);
      expect(order.partLines).toHaveLength(1);
      expect(order.partLines[0].quantity).toBe(2);
    });

    it('falha quando serviço do catálogo não existe', async () => {
      const uc = new OpenServiceOrderUseCase(
        new InMemoryClientProvisioning(),
        new InMemoryVehicleProvisioning(),
        new InMemoryServiceOrderRepository(),
        new InMemoryCatalogServiceRepository(),
        new InMemoryProductLookup(),
      );

      await expect(
        uc.execute({
          client: {
            name: 'Maria',
            document: '87075443089',
            email: 'maria@example.com',
          },
          vehicle: {
            plate: 'MVO9884',
            brand: 'Fiat',
            model: 'Uno',
            year: 2015,
          },
          services: [{ catalogServiceId: 'missing' }],
        }),
      ).rejects.toBeInstanceOf(EntityNotFoundError);
    });

    it('falha quando serviço do catálogo está inativo', async () => {
      const inactiveCatalog = CatalogService.create(
        {
          name: 'Serviço inativo',
          basePrice: 50,
          active: false,
          defaultParts: [],
        },
        'catalog-inactive',
      );
      const uc = new OpenServiceOrderUseCase(
        new InMemoryClientProvisioning(),
        new InMemoryVehicleProvisioning(),
        new InMemoryServiceOrderRepository(),
        new InMemoryCatalogServiceRepository().seed(inactiveCatalog),
        new InMemoryProductLookup(),
      );

      await expect(
        uc.execute({
          client: {
            name: 'Maria',
            document: '87075443089',
            email: 'maria@example.com',
          },
          vehicle: {
            plate: 'MVO9884',
            brand: 'Fiat',
            model: 'Uno',
            year: 2015,
          },
          services: [{ catalogServiceId: 'catalog-inactive' }],
        }),
      ).rejects.toBeInstanceOf(BusinessRuleViolationError);
    });
  });

  describe('GetAllServiceOrdersUseCase', () => {
    it('ordena por status e mais antigas primeiro, excluindo finalizadas/entregues/canceladas', async () => {
      const older = restoreOrder('os-received-old', {
        status: ServiceOrderStatus.RECEIVED,
        createdAt: new Date('2026-05-01T08:00:00.000Z'),
        updatedAt: new Date('2026-05-01T08:00:00.000Z'),
      });
      const newer = restoreOrder('os-received-new', {
        status: ServiceOrderStatus.RECEIVED,
        createdAt: new Date('2026-05-01T12:00:00.000Z'),
        updatedAt: new Date('2026-05-01T12:00:00.000Z'),
      });
      const waiting = restoreOrder('os-waiting', {
        status: ServiceOrderStatus.WAITING_APPROVAL,
        createdAt: new Date('2026-05-01T09:00:00.000Z'),
        updatedAt: new Date('2026-05-01T09:00:00.000Z'),
      });
      const execution = restoreOrder('os-execution', {
        status: ServiceOrderStatus.IN_EXECUTION,
        createdAt: new Date('2026-05-01T10:00:00.000Z'),
        updatedAt: new Date('2026-05-01T10:00:00.000Z'),
      });
      const finished = createFinishedOrder('os-finished');
      const cancelled = restoreOrder('os-cancelled', {
        status: ServiceOrderStatus.CANCELLED,
      });

      const orderRepo = new InMemoryServiceOrderRepository().seed(
        older,
        newer,
        waiting,
        execution,
        finished,
        cancelled,
      );
      const uc = new GetAllServiceOrdersUseCase(orderRepo);
      const list = await uc.execute();

      expect(list.map((order) => order.id)).toEqual([
        'os-execution',
        'os-waiting',
        'os-received-old',
        'os-received-new',
      ]);
    });
  });

  describe('GetServiceOrderUseCase', () => {
    it('retorna a OS quando encontrada', async () => {
      const order = createReceivedOrder('os-1');
      const uc = new GetServiceOrderUseCase(
        new InMemoryServiceOrderRepository().seed(order),
      );

      const found = await uc.execute('os-1');
      expect(found.id).toBe('os-1');
    });

    it('retorna 404 quando OS não existe', async () => {
      const uc = new GetServiceOrderUseCase(
        new InMemoryServiceOrderRepository(),
      );

      await expect(uc.execute('missing')).rejects.toBeInstanceOf(
        EntityNotFoundError,
      );
    });
  });

  describe('RegisterDiagnosisUseCase', () => {
    it('registra diagnóstico e move para IN_DIAGNOSIS', async () => {
      const order = createReceivedOrder('os-1');
      const orderRepo = new InMemoryServiceOrderRepository().seed(order);
      const uc = new RegisterDiagnosisUseCase(orderRepo);

      const updated = await uc.execute('os-1', 'Correia desgastada');

      expect(updated.diagnosis).toBe('Correia desgastada');
      expect(updated.status).toBe(ServiceOrderStatus.IN_DIAGNOSIS);
    });

    it('rejeita diagnóstico vazio', async () => {
      const orderRepo = new InMemoryServiceOrderRepository().seed(
        createReceivedOrder('os-1'),
      );
      const uc = new RegisterDiagnosisUseCase(orderRepo);

      await expect(uc.execute('os-1', '   ')).rejects.toBeInstanceOf(
        BusinessRuleViolationError,
      );
    });
  });

  describe('AddPartToOrderUseCase', () => {
    it('adiciona peça à OS', async () => {
      const orderRepo = new InMemoryServiceOrderRepository().seed(
        createReceivedOrder('os-1'),
      );
      const productLookup = new InMemoryProductLookup().seed(
        defaultProductSnapshot(),
      );
      const uc = new AddPartToOrderUseCase(orderRepo, productLookup);

      const updated = await uc.execute('os-1', TEST_PRODUCT_CODE, 2);

      expect(updated.partLines).toHaveLength(1);
      expect(updated.partLines[0].productCode).toBe(TEST_PRODUCT_CODE);
      expect(updated.partLines[0].quantity).toBe(2);
      expect(updated.status).toBe(ServiceOrderStatus.IN_DIAGNOSIS);
    });

    it('retorna 404 quando produto não existe', async () => {
      const uc = new AddPartToOrderUseCase(
        new InMemoryServiceOrderRepository().seed(createReceivedOrder('os-1')),
        new InMemoryProductLookup(),
      );

      await expect(uc.execute('os-1', 'MISSING', 1)).rejects.toBeInstanceOf(
        EntityNotFoundError,
      );
    });
  });

  describe('AddServiceToOrderUseCase', () => {
    it('adiciona serviço do catálogo à OS', async () => {
      const orderRepo = new InMemoryServiceOrderRepository().seed(
        createReceivedOrder('os-1'),
      );
      const catalogRepo = new InMemoryCatalogServiceRepository().seed(
        defaultCatalogService(),
      );
      const productLookup = new InMemoryProductLookup().seed(
        defaultProductSnapshot(),
      );
      const uc = new AddServiceToOrderUseCase(
        orderRepo,
        catalogRepo,
        productLookup,
      );

      const updated = await uc.execute('os-1', TEST_CATALOG_ID, 1);

      expect(updated.serviceLines).toHaveLength(1);
      expect(updated.serviceLines[0].catalogServiceId).toBe(TEST_CATALOG_ID);
      expect(updated.status).toBe(ServiceOrderStatus.IN_DIAGNOSIS);
    });

    it('rejeita serviço inativo do catálogo', async () => {
      const inactiveCatalog = CatalogService.create(
        {
          name: 'Serviço inativo',
          basePrice: 50,
          active: false,
          defaultParts: [],
        },
        'catalog-inactive',
      );
      const uc = new AddServiceToOrderUseCase(
        new InMemoryServiceOrderRepository().seed(createReceivedOrder('os-1')),
        new InMemoryCatalogServiceRepository().seed(inactiveCatalog),
        new InMemoryProductLookup(),
      );

      await expect(
        uc.execute('os-1', 'catalog-inactive', 1),
      ).rejects.toBeInstanceOf(BusinessRuleViolationError);
    });
  });

  describe('GenerateBudgetUseCase', () => {
    it('gera orçamento, muda status e notifica cliente', async () => {
      const order = createDiagnosedOrderWithService('os-1');
      const orderRepo = new InMemoryServiceOrderRepository().seed(order);
      const clientLookup = new InMemoryClientLookup().seed(
        defaultClientSnapshot(),
      );
      const notifier = new SpyBudgetDeliveryNotifier();
      const stock = new InMemoryStockService(
        [],
        [
          {
            productCode: TEST_PRODUCT_CODE,
            required: 1,
            totalCost: 50,
            unitPrice: 50,
          },
        ],
      );
      const uc = new GenerateBudgetUseCase(
        orderRepo,
        clientLookup,
        notifier,
        stock,
      );

      const updated = await uc.execute('os-1');

      expect(updated.status).toBe(ServiceOrderStatus.WAITING_APPROVAL);
      expect(updated.budget?.total).toBe(200);
      expect(notifier.calls).toHaveLength(1);
      expect(notifier.calls[0].serviceOrderId).toBe('os-1');
      expect(notifier.calls[0].clientEmail).toBe('maria@example.com');
    });

    it('exige diagnóstico antes de gerar orçamento', async () => {
      const order = createReceivedOrder('os-1');
      order.addServiceLine({
        catalogServiceId: TEST_CATALOG_ID,
        name: 'Troca de correia',
        unitPrice: 150,
        quantity: 1,
        defaultParts: [],
      });
      const uc = new GenerateBudgetUseCase(
        new InMemoryServiceOrderRepository().seed(order),
        new InMemoryClientLookup().seed(defaultClientSnapshot()),
        new SpyBudgetDeliveryNotifier(),
        new InMemoryStockService(),
      );

      await expect(uc.execute('os-1')).rejects.toBeInstanceOf(
        BusinessRuleViolationError,
      );
    });
  });

  describe('ApproveBudgetUseCase', () => {
    it('aprova orçamento, baixa estoque e inicia execução', async () => {
      const order = createWaitingApprovalOrder('os-1');
      const orderRepo = new InMemoryServiceOrderRepository().seed(order);
      const stock = new InMemoryStockService([
        {
          productCode: TEST_PRODUCT_CODE,
          required: 1,
          available: 5,
        },
      ]);
      const uc = new ApproveBudgetUseCase(orderRepo, stock);

      const updated = await uc.execute('os-1');

      expect(updated.status).toBe(ServiceOrderStatus.IN_EXECUTION);
      expect(updated.budget?.approved).toBe(true);
      expect(stock.decreased).toEqual([
        { productCode: TEST_PRODUCT_CODE, quantity: 1 },
      ]);
    });

    it('é idempotente quando OS já está em execução', async () => {
      const order = createInExecutionOrder('os-1');
      const orderRepo = new InMemoryServiceOrderRepository().seed(order);
      const stock = new InMemoryStockService();
      const uc = new ApproveBudgetUseCase(orderRepo, stock);

      const updated = await uc.execute('os-1');

      expect(updated.status).toBe(ServiceOrderStatus.IN_EXECUTION);
      expect(stock.decreased).toHaveLength(0);
    });

    it('retorna conflito quando não há estoque suficiente', async () => {
      const order = createWaitingApprovalOrder('os-1');
      const orderRepo = new InMemoryServiceOrderRepository().seed(order);
      const stock = new InMemoryStockService([
        {
          productCode: TEST_PRODUCT_CODE,
          required: 1,
          available: 0,
        },
      ]);
      const uc = new ApproveBudgetUseCase(orderRepo, stock);

      await expect(uc.execute('os-1')).rejects.toMatchObject({
        name: 'ConflictError',
        code: STOCK_SHORTAGE_CODE,
      });
      await expect(uc.execute('os-1')).rejects.toBeInstanceOf(ConflictError);
    });
  });

  describe('RejectBudgetUseCase', () => {
    it('reprova orçamento e cancela a OS', async () => {
      const orderRepo = new InMemoryServiceOrderRepository().seed(
        createWaitingApprovalOrder('os-1'),
      );
      const uc = new RejectBudgetUseCase(orderRepo);

      const updated = await uc.execute('os-1', 'Cliente recusou valores');

      expect(updated.status).toBe(ServiceOrderStatus.CANCELLED);
      expect(updated.cancellationReason).toBe('Cliente recusou valores');
      expect(updated.budget).toBeUndefined();
    });
  });

  describe('FinishServiceOrderUseCase', () => {
    it('finaliza OS em execução', async () => {
      const orderRepo = new InMemoryServiceOrderRepository().seed(
        createInExecutionOrder('os-1'),
      );
      const uc = new FinishServiceOrderUseCase(orderRepo);

      const updated = await uc.execute('os-1');

      expect(updated.status).toBe(ServiceOrderStatus.FINISHED);
      expect(updated.finishedAt).toBeInstanceOf(Date);
    });

    it('rejeita finalização fora de execução', async () => {
      const uc = new FinishServiceOrderUseCase(
        new InMemoryServiceOrderRepository().seed(createReceivedOrder('os-1')),
      );

      await expect(uc.execute('os-1')).rejects.toBeInstanceOf(
        BusinessRuleViolationError,
      );
    });
  });

  describe('DeliverServiceOrderUseCase', () => {
    it('entrega OS finalizada', async () => {
      const orderRepo = new InMemoryServiceOrderRepository().seed(
        createFinishedOrder('os-1'),
      );
      const uc = new DeliverServiceOrderUseCase(orderRepo);

      const updated = await uc.execute('os-1');

      expect(updated.status).toBe(ServiceOrderStatus.DELIVERED);
      expect(updated.deliveredAt).toBeInstanceOf(Date);
    });
  });
});
