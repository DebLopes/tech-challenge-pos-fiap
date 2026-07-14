import { Module } from '@nestjs/common';

import {
  CreateProductBatchUseCase,
  DecreaseProductStockUseCase,
  GetProductBatchUseCase,
  GetProductStockUseCase,
} from '../../application/use-case/product-batch';
import { STOCK_SERVICE } from '../../../shared/domain/ports/stock-service.port';
import { ProductBatchController } from '../../interfaces/http/product-batch/product-batch.controller';
import { EstoqueDatabaseModule } from '../database/database.module';
import { ProductBatchStockService } from '../stock/product-batch-stock.service';

@Module({
  imports: [EstoqueDatabaseModule],
  providers: [
    CreateProductBatchUseCase,
    GetProductBatchUseCase,
    GetProductStockUseCase,
    DecreaseProductStockUseCase,
    ProductBatchStockService,
    { provide: STOCK_SERVICE, useExisting: ProductBatchStockService },
  ],
  controllers: [ProductBatchController],
  exports: [GetProductStockUseCase, DecreaseProductStockUseCase, STOCK_SERVICE],
})
export class ProductBatchModule {}
