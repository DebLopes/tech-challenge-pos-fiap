import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SWAGGER_JWT_AUTH } from '../../../../identidade/interfaces/http/auth/decorators/auth-roles.decorator';

export function configureHttpApp(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('API Oficina Mecânica')
    .setDescription(
      'Sistema para gestão de ordens de serviço, clientes, veículos, peças e execução de serviços',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      SWAGGER_JWT_AUTH,
    )
    .build();

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
}
