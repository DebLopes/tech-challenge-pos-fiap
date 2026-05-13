import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { INTEGRATION_USER_PASSWORD } from '../dev-credentials.fixture';
import {
  bootstrapIntegrationApp,
  loginAsIntegrationAdmin,
  loginWithCredentials,
  shutdownIntegrationApp,
} from '../helpers/integration-app';

describe('Estoque — papel estoquista (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await bootstrapIntegrationApp();
  }, 120_000);

  afterAll(async () => {
    await shutdownIntegrationApp(app);
  });

  it('estoquista: POST /product e POST /product-batch com sucesso', async () => {
    const adminToken = await loginAsIntegrationAdmin(app);
    const authAdmin = { Authorization: `Bearer ${adminToken}` };
    const json = { 'Content-Type': 'application/json' };

    const suffix = Date.now();
    const stockistEmail = `integration-estoquista-${suffix}@test.dev`;
    const stockistPassword = INTEGRATION_USER_PASSWORD;

    const register = await request(app.getHttpServer())
      .post('/auth/users')
      .set(authAdmin)
      .set(json)
      .send({
        name: 'Integration Estoquista',
        email: stockistEmail,
        password: stockistPassword,
        role: 'estoquista',
        active: true,
      });
    expect(register.status).toBe(201);

    const stockistToken = await loginWithCredentials(
      app,
      stockistEmail,
      stockistPassword,
    );
    const authStockist = { Authorization: `Bearer ${stockistToken}` };

    const productCode = `INT-STK-${suffix}`;
    const productRes = await request(app.getHttpServer())
      .post('/product')
      .set(authStockist)
      .set(json)
      .send({
        code: productCode,
        name: 'Peça teste estoquista',
        description: 'Integração',
      });
    expect([200, 201]).toContain(productRes.status);

    const batchRes = await request(app.getHttpServer())
      .post('/product-batch')
      .set(authStockist)
      .set(json)
      .send({
        name: 'Lote teste',
        productCode,
        quantity: 10,
        costPrice: 2,
        salePrice: 5,
      });
    expect([200, 201]).toContain(batchRes.status);
  });

  it('atendente: POST /product retorna 403', async () => {
    const adminToken = await loginAsIntegrationAdmin(app);
    const authAdmin = { Authorization: `Bearer ${adminToken}` };
    const json = { 'Content-Type': 'application/json' };

    const suffix = Date.now();
    const atendenteEmail = `integration-atendente-stock-${suffix}@test.dev`;

    const register = await request(app.getHttpServer())
      .post('/auth/users')
      .set(authAdmin)
      .set(json)
      .send({
        name: 'Integration Atendente',
        email: atendenteEmail,
        password: INTEGRATION_USER_PASSWORD,
        role: 'atendente',
        active: true,
      });
    expect(register.status).toBe(201);

    const token = await loginWithCredentials(
      app,
      atendenteEmail,
      INTEGRATION_USER_PASSWORD,
    );
    const res = await request(app.getHttpServer())
      .post('/product')
      .set({ Authorization: `Bearer ${token}` })
      .set(json)
      .send({
        code: `INT-ATT-${suffix}`,
        name: 'Não deve criar',
      });
    expect(res.status).toBe(403);
  });
});
