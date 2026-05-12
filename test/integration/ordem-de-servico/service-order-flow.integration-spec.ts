import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { VALID_CPF_FLOW, VALID_PLATE_FLOW } from '../mocks/flow.mock';
import {
  bootstrapIntegrationApp,
  loginAsIntegrationAdmin,
  shutdownIntegrationApp,
} from '../helpers/integration-app';

const INTEGRATION_PRODUCT_CODE = 'INT-PART-01';
const INTEGRATION_EXTRA_PART_CODE = 'INT-PART-02';
const INTEGRATION_CATALOG_SERVICE_NAME = 'Serviço integração OS';

describe('Service order flow (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await bootstrapIntegrationApp();
  }, 120_000);

  afterAll(async () => {
    await shutdownIntegrationApp(app);
  });

  it('fluxo ponta a ponta: estoque, catálogo, OS, diagnóstico, serviço, peça avulsa, orçamento, aprovação pública, execução, métrica, entrega e fechamento público', async () => {
    const token = await loginAsIntegrationAdmin(app);
    const auth = { Authorization: `Bearer ${token}` };
    const json = { 'Content-Type': 'application/json' };

    const productRes = await request(app.getHttpServer())
      .post('/product')
      .set(auth)
      .set(json)
      .send({
        code: INTEGRATION_PRODUCT_CODE,
        name: 'Peça integração',
        description: 'Para FIFO na OS',
      });
    expect([200, 201]).toContain(productRes.status);

    const batchRes = await request(app.getHttpServer())
      .post('/product-batch')
      .set(auth)
      .set(json)
      .send({
        name: 'Lote integração',
        productCode: INTEGRATION_PRODUCT_CODE,
        quantity: 100,
        costPrice: 10,
        salePrice: 25,
      });
    expect([200, 201]).toContain(batchRes.status);

    const productExtra = await request(app.getHttpServer())
      .post('/product')
      .set(auth)
      .set(json)
      .send({
        code: INTEGRATION_EXTRA_PART_CODE,
        name: 'Peça avulsa integração',
      });
    expect([200, 201]).toContain(productExtra.status);

    const batchExtra = await request(app.getHttpServer())
      .post('/product-batch')
      .set(auth)
      .set(json)
      .send({
        name: 'Lote peça avulsa',
        productCode: INTEGRATION_EXTRA_PART_CODE,
        quantity: 50,
        costPrice: 5,
        salePrice: 12,
      });
    expect([200, 201]).toContain(batchExtra.status);

    const catalogRes = await request(app.getHttpServer())
      .post('/services')
      .set(auth)
      .set(json)
      .send({
        name: INTEGRATION_CATALOG_SERVICE_NAME,
        description: 'Com uma peça padrão',
        basePrice: 80,
        active: true,
        defaultParts: [{ productCode: INTEGRATION_PRODUCT_CODE, quantity: 1 }],
      });
    expect([200, 201]).toContain(catalogRes.status);
    const catalogServiceId = catalogRes.body.id as string;

    const createClient = await request(app.getHttpServer())
      .post('/clients')
      .set(auth)
      .set(json)
      .send({
        name: 'Cliente integração',
        document: VALID_CPF_FLOW,
        email: 'integration-flow@test.dev',
      });
    expect([200, 201]).toContain(createClient.status);
    const clientId = createClient.body.id as string;

    const createVehicle = await request(app.getHttpServer())
      .post('/vehicle')
      .set(auth)
      .set(json)
      .send({
        plate: VALID_PLATE_FLOW,
        model: 'HR-V',
        brand: 'Honda',
        year: 2024,
      });
    expect([200, 201]).toContain(createVehicle.status);
    const vehicleId = createVehicle.body.id as string;

    const createOs = await request(app.getHttpServer())
      .post('/service-orders')
      .set(auth)
      .set(json)
      .send({
        clientId,
        vehicleId,
        requestedServicesDescription: 'Revisão integração',
      });
    expect([200, 201]).toContain(createOs.status);
    const osId = createOs.body.id as string;
    expect(createOs.body.status).toBeDefined();

    const diagnosisRes = await request(app.getHttpServer())
      .patch(`/service-orders/${osId}/diagnosis`)
      .set(auth)
      .set(json)
      .send({ diagnosis: 'Diagnóstico registrado no teste de integração.' });
    expect([200, 201]).toContain(diagnosisRes.status);
    expect(diagnosisRes.body.status).toBe('IN_DIAGNOSIS');

    const addServiceRes = await request(app.getHttpServer())
      .post(`/service-orders/${osId}/services`)
      .set(auth)
      .set(json)
      .send({
        catalogServiceId,
        quantity: 1,
      });
    expect([200, 201]).toContain(addServiceRes.status);

    const addPartRes = await request(app.getHttpServer())
      .post(`/service-orders/${osId}/parts`)
      .set(auth)
      .set(json)
      .send({
        productCode: INTEGRATION_EXTRA_PART_CODE,
        quantity: 2,
      });
    expect([200, 201]).toContain(addPartRes.status);

    const budgetRes = await request(app.getHttpServer())
      .post(`/service-orders/${osId}/budget`)
      .set(auth);
    expect([200, 201]).toContain(budgetRes.status);
    expect(budgetRes.body.status).toBe('WAITING_APPROVAL');
    expect(budgetRes.body.budget?.total).toBeGreaterThan(0);

    const publicBudget = await request(app.getHttpServer())
      .get(`/public/service-orders/${osId}/budget`)
      .query({ document: VALID_CPF_FLOW, plate: VALID_PLATE_FLOW });
    expect(publicBudget.status).toBe(200);
    expect(publicBudget.body.total).toBe(budgetRes.body.budget.total);
    const partItemMain = publicBudget.body.items.find(
      (i: { referenceId: string }) =>
        i.referenceId === INTEGRATION_PRODUCT_CODE,
    );
    expect(partItemMain?.description).toBe('Peça integração');
    const partItemExtra = publicBudget.body.items.find(
      (i: { referenceId: string }) =>
        i.referenceId === INTEGRATION_EXTRA_PART_CODE,
    );
    expect(partItemExtra?.description).toBe('Peça avulsa integração');

    const publicApprove = await request(app.getHttpServer())
      .post(`/public/service-orders/${osId}/approve-budget`)
      .query({ document: VALID_CPF_FLOW, plate: VALID_PLATE_FLOW });
    expect([200, 201]).toContain(publicApprove.status);
    expect(publicApprove.body.status).toBe('IN_EXECUTION');

    const finishRes = await request(app.getHttpServer())
      .post(`/service-orders/${osId}/finish`)
      .set(auth);
    expect([200, 201]).toContain(finishRes.status);
    expect(finishRes.body.status).toBe('FINISHED');

    const publicStatusWhileFinished = await request(app.getHttpServer())
      .get('/public/service-orders/status')
      .query({ document: VALID_CPF_FLOW });
    expect(publicStatusWhileFinished.status).toBe(200);
    expect(
      publicStatusWhileFinished.body.items.some(
        (row: { serviceOrderId: string }) => row.serviceOrderId === osId,
      ),
    ).toBe(true);

    const metricsRes = await request(app.getHttpServer())
      .get('/service-orders/metrics/average-execution-time')
      .set(auth);
    expect(metricsRes.status).toBe(200);
    expect(typeof metricsRes.body.averageMinutes).toBe('number');
    expect(metricsRes.body.sampleSize).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(metricsRes.body.items)).toBe(true);
    const metricRow = metricsRes.body.items.find(
      (row: { serviceOrderId: string }) => row.serviceOrderId === osId,
    );
    expect(metricRow).toBeDefined();
    expect(typeof metricRow.executionMinutes).toBe('number');
    expect(typeof metricRow.startedAt).toBe('string');
    expect(typeof metricRow.finishedAt).toBe('string');
    expect(typeof metricRow.vehiclePlate).toBe('string');

    const deliverRes = await request(app.getHttpServer())
      .post(`/service-orders/${osId}/deliver`)
      .set(auth);
    expect([200, 201]).toContain(deliverRes.status);
    expect(deliverRes.body.status).toBe('DELIVERED');
    expect(deliverRes.body.deliveredAt).toBeDefined();

    const getOne = await request(app.getHttpServer())
      .get(`/service-orders/${osId}`)
      .set(auth);
    expect(getOne.status).toBe(200);
    expect(getOne.body.status).toBe('DELIVERED');

    const publicStatusAfterDeliver = await request(app.getHttpServer())
      .get('/public/service-orders/status')
      .query({ document: VALID_CPF_FLOW });
    expect(publicStatusAfterDeliver.status).toBe(200);
    expect(
      publicStatusAfterDeliver.body.items.some(
        (row: { serviceOrderId: string }) => row.serviceOrderId === osId,
      ),
    ).toBe(false);
  });
});
