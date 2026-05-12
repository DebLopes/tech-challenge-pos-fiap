import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { expect } from '@jest/globals';
import request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { configureHttpApp } from '../../../src/contexts/shared/interfaces/http/config/configure-http-app';
import { integrationAdminCredentials } from '../mocks/auth.mock';
import { resolveIntegrationMongoUrl } from './mongo-url';

export async function bootstrapIntegrationApp(): Promise<INestApplication> {
  process.env.MONGO_URL = resolveIntegrationMongoUrl();
  process.env.JWT_SECRET =
    'integration-test-secret-at-least-32-characters-long';
  process.env.JWT_EXPIRES_IN = '1d';
  process.env.SEED_ADMIN_EMAIL = integrationAdminCredentials.email;
  process.env.SEED_ADMIN_PASSWORD = integrationAdminCredentials.password;
  process.env.SEED_ADMIN_NAME = integrationAdminCredentials.name;

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  configureHttpApp(app);
  await app.init();
  return app;
}

export async function shutdownIntegrationApp(
  app: INestApplication,
): Promise<void> {
  await app.close();
}

export async function loginWithCredentials(
  app: INestApplication,
  email: string,
  password: string,
): Promise<string> {
  const res = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password });
  expect([200, 201]).toContain(res.status);
  expect(typeof res.body.access_token).toBe('string');
  return res.body.access_token as string;
}

export async function loginAsIntegrationAdmin(
  app: INestApplication,
): Promise<string> {
  return loginWithCredentials(
    app,
    integrationAdminCredentials.email,
    integrationAdminCredentials.password,
  );
}
