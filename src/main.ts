import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureHttpApp } from './contexts/shared/interfaces/http/config/configure-http-app';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureHttpApp(app);
  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
