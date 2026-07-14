import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  bootstrapIntegrationApp,
  loginAsIntegrationAdmin,
  shutdownIntegrationApp,
} from '../helpers/integration-app';

const OPEN_CPF = '16899535009';
const OPEN_PLATE = 'JKL3M45';
const OPEN_CPF_LINES = '39053344705';
const OPEN_PLATE_LINES = 'NOP6Q78';
const OPEN_PART_CODE = 'OPEN-PART-01';
const OPEN_CATALOG_NAME = 'Serviço abertura OS';

describe('Open service order (integration)', () => {
  let app: INestApplication;
  let auth: { Authorization: string };
  const json = { 'Content-Type': 'application/json' };

  beforeAll(async () => {
    app = await bootstrapIntegrationApp();
    const token = await loginAsIntegrationAdmin(app);
    auth = { Authorization: `Bearer ${token}` };
  }, 120_000);

  afterAll(async () => {
    await shutdownIntegrationApp(app);
  });

  it('abre OS criando cliente e veículo em uma única chamada', async () => {
    const res = await request(app.getHttpServer())
      .post('/service-orders/open')
      .set(auth)
      .set(json)
      .send({
        client: {
          name: 'Cliente Abertura',
          email: 'abertura@test.dev',
          document: OPEN_CPF,
        },
        vehicle: {
          plate: OPEN_PLATE,
          brand: 'Fiat',
          model: 'Argo',
          year: 2022,
        },
        requestedServicesDescription: 'Revisão completa',
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body.id).toBeDefined();
    expect(res.body.status).toBe('RECEIVED');
    expect(res.body.client.document).toBe(OPEN_CPF);
    expect(res.body.vehicle.plate).toBe(OPEN_PLATE);
    expect(res.body.serviceLines).toHaveLength(0);
    expect(res.body.partLines).toHaveLength(0);
  });

  it('reaproveita cliente e veículo já existentes por documento/placa', async () => {
    const first = await request(app.getHttpServer())
      .post('/service-orders/open')
      .set(auth)
      .set(json)
      .send({
        client: {
          name: 'Cliente Reuso',
          email: 'reuso@test.dev',
          document: OPEN_CPF,
        },
        vehicle: {
          plate: OPEN_PLATE,
          brand: 'Fiat',
          model: 'Argo',
          year: 2022,
        },
      });
    expect([200, 201]).toContain(first.status);

    const second = await request(app.getHttpServer())
      .post('/service-orders/open')
      .set(auth)
      .set(json)
      .send({
        client: {
          name: 'Ignorado no reuso',
          email: 'ignorado@test.dev',
          document: OPEN_CPF,
        },
        vehicle: {
          plate: OPEN_PLATE,
          brand: 'Ignorado',
          model: 'Ignorado',
          year: 1999,
        },
      });
    expect([200, 201]).toContain(second.status);

    expect(second.body.client.id).toBe(first.body.client.id);
    expect(second.body.vehicle.id).toBe(first.body.vehicle.id);
  });

  it('abre OS com serviços e peças vinculados na mesma chamada', async () => {
    const productRes = await request(app.getHttpServer())
      .post('/product')
      .set(auth)
      .set(json)
      .send({ code: OPEN_PART_CODE, name: 'Peça abertura' });
    expect([200, 201]).toContain(productRes.status);

    const batchRes = await request(app.getHttpServer())
      .post('/product-batch')
      .set(auth)
      .set(json)
      .send({
        name: 'Lote abertura',
        productCode: OPEN_PART_CODE,
        quantity: 50,
        costPrice: 10,
        salePrice: 25,
      });
    expect([200, 201]).toContain(batchRes.status);

    const catalogRes = await request(app.getHttpServer())
      .post('/services')
      .set(auth)
      .set(json)
      .send({
        name: OPEN_CATALOG_NAME,
        description: 'Serviço para abertura',
        basePrice: 100,
        active: true,
      });
    expect([200, 201]).toContain(catalogRes.status);
    const catalogServiceId = catalogRes.body.id as string;

    const res = await request(app.getHttpServer())
      .post('/service-orders/open')
      .set(auth)
      .set(json)
      .send({
        client: {
          name: 'Cliente Linhas',
          email: 'linhas@test.dev',
          document: OPEN_CPF_LINES,
        },
        vehicle: {
          plate: OPEN_PLATE_LINES,
          brand: 'VW',
          model: 'Polo',
          year: 2023,
        },
        requestedServicesDescription: 'Troca de óleo',
        services: [{ catalogServiceId, quantity: 1 }],
        parts: [{ productCode: OPEN_PART_CODE, quantity: 2 }],
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body.id).toBeDefined();
    expect(res.body.status).toBe('RECEIVED');
    expect(res.body.serviceLines).toHaveLength(1);
    expect(res.body.partLines).toHaveLength(1);
    expect(res.body.partLines[0].productCode).toBe(OPEN_PART_CODE);
  });
});
