import { Module } from '@nestjs/common';
import {
  CreateClientUseCase,
  DeleteClientUseCase,
  GetAllClientsUseCase,
  GetClientUseCase,
  UpdateClientUseCase,
} from '../../application/use-case/client';
import { ClientController } from '../../interfaces/http/client/client.controller';
import { IdentidadeDatabaseModule } from '../database/database.module';

@Module({
  imports: [IdentidadeDatabaseModule],
  providers: [
    CreateClientUseCase,
    GetAllClientsUseCase,
    GetClientUseCase,
    UpdateClientUseCase,
    DeleteClientUseCase,
  ],
  controllers: [ClientController],
  exports: [CreateClientUseCase, IdentidadeDatabaseModule],
})
export class ClientModule {}
