import { Module } from '@nestjs/common';
import { ProductModule } from '../../../estoque/infrastructure/ioc/product.module';
import { ProductBatchModule } from '../../../estoque/infrastructure/ioc/product-batch.module';

@Module({
  imports: [ProductModule, ProductBatchModule],
  exports: [ProductModule, ProductBatchModule],
})
export class EstoqueModule {}
