import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Em testes, não carregar `.env` do disco: evita JWT/seed vazios a sobrescrever o que o bootstrap de integração define.
      ignoreEnvFile: process.env.NODE_ENV === 'test',
      envFilePath: '.env',
    }),
  ],
})
export class ConfigureModule {}
