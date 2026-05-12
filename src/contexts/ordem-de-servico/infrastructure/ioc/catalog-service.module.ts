import { Module } from '@nestjs/common';
import {
  CreateCatalogServiceUseCase,
  DeleteCatalogServiceUseCase,
  GetAllCatalogServicesUseCase,
  GetCatalogServiceUseCase,
  UpdateCatalogServiceUseCase,
} from '../../application/use-case/catalog-service';
import { CatalogServiceController } from '../../interfaces/http/catalog-service/catalog-service.controller';
import { CatalogServiceDatabaseModule } from '../database/catalog-service-database.module';
import { EstoqueModule } from '../../../shared/infrastructure/ioc/estoque.module';

@Module({
  imports: [CatalogServiceDatabaseModule, EstoqueModule],
  providers: [
    CreateCatalogServiceUseCase,
    GetAllCatalogServicesUseCase,
    GetCatalogServiceUseCase,
    UpdateCatalogServiceUseCase,
    DeleteCatalogServiceUseCase,
  ],
  controllers: [CatalogServiceController],
})
export class CatalogServiceModule {}
