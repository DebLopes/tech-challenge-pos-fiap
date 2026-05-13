import { randomBytes } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { integrationAdminCredentials } from '../mocks/auth.mock';
import {
  bootstrapIntegrationApp,
  shutdownIntegrationApp,
} from '../helpers/integration-app';

describe('Auth (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await bootstrapIntegrationApp();
  }, 120_000);

  afterAll(async () => {
    await shutdownIntegrationApp(app);
  });

  it('POST /auth/login — credenciais inválidas — 401', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: integrationAdminCredentials.email,
        password: randomBytes(18).toString('base64url'),
      });
    expect(res.status).toBe(401);
  });

  it('POST /auth/login — retorna JWT', async () => {
    const res = await request(app.getHttpServer()).post('/auth/login').send({
      email: integrationAdminCredentials.email,
      password: integrationAdminCredentials.password,
    });
    expect([200, 201]).toContain(res.status);
    expect(typeof res.body.access_token).toBe('string');
    expect(res.body.access_token.length).toBeGreaterThan(10);
  });
});
