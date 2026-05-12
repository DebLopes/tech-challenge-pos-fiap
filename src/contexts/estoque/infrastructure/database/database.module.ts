import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongodbModule } from '../../../shared/infrastructure/database/mongodb/mongodb.module';
import {
  ProductBatchModel,
  ProductBatchSchema,
} from './mongodb/models/product-batch/product-batch.model';
import {
  ProductModel,
  ProductSchema,
} from './mongodb/models/product/product.model';
import { MongodbProductBatchRepository } from './mongodb/repositories/mongodb-product-batch-repository';
import { MongodbProductRepository } from './mongodb/repositories/mongodb-product-repository';
import {
  PRODUCT_BATCH_REPOSITORY,
  PRODUCT_REPOSITORY,
} from '../../domain/repositories/tokens';

@Module({
  imports: [
    MongodbModule,
    MongooseModule.forFeature([
      {
        name: ProductModel.name,
        schema: ProductSchema,
      },
      {
        name: ProductBatchModel.name,
        schema: ProductBatchSchema,
      },
    ]),
  ],
  providers: [
    {
      provide: PRODUCT_REPOSITORY,
      useClass: MongodbProductRepository,
    },
    {
      provide: PRODUCT_BATCH_REPOSITORY,
      useClass: MongodbProductBatchRepository,
    },
  ],
  exports: [PRODUCT_REPOSITORY, PRODUCT_BATCH_REPOSITORY],
})
export class EstoqueDatabaseModule {}
