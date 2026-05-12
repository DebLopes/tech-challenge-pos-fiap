import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongodbModule } from '../../../shared/infrastructure/database/mongodb/mongodb.module';
import { CATALOG_SERVICE_REPOSITORY } from '../../domain/repositories/catalog-service-repository.token';
import {
  CatalogServiceModel,
  CatalogServiceSchema,
} from './mongodb/models/catalog-service/catalog-service.model';
import { MongodbCatalogServiceRepository } from './mongodb/repositories/mongodb-catalog-service-repository';

@Module({
  imports: [
    MongodbModule,
    MongooseModule.forFeature([
      {
        name: CatalogServiceModel.name,
        schema: CatalogServiceSchema,
      },
    ]),
  ],
  providers: [
    {
      provide: CATALOG_SERVICE_REPOSITORY,
      useClass: MongodbCatalogServiceRepository,
    },
  ],
  exports: [CATALOG_SERVICE_REPOSITORY],
})
export class CatalogServiceDatabaseModule {}
