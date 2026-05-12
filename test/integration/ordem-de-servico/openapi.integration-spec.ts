import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  bootstrapIntegrationApp,
  shutdownIntegrationApp,
} from '../helpers/integration-app';

describe('OpenAPI (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await bootstrapIntegrationApp();
  }, 120_000);

  afterAll(async () => {
    await shutdownIntegrationApp(app);
  });

  it('GET /api-json — documento OpenAPI (Swagger)', async () => {
    const res = await request(app.getHttpServer()).get('/api-json');
    expect(res.status).toBe(200);
    expect(res.body.openapi || res.body.swagger).toBeDefined();
  });
});
