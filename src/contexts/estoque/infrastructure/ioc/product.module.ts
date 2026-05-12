import { Module } from '@nestjs/common';
import {
  CreateProductUseCase,
  DeleteProductUseCase,
  GetAllProductUseCase,
  GetProductUseCase,
  UpdateProductUseCase,
} from '../../application/use-case/product';
import { ProductController } from '../../interfaces/http/product/product.controller';
import { EstoqueDatabaseModule } from '../database/database.module';

@Module({
  imports: [EstoqueDatabaseModule],
  providers: [
    CreateProductUseCase,
    GetAllProductUseCase,
    DeleteProductUseCase,
    GetProductUseCase,
    UpdateProductUseCase,
  ],
  controllers: [ProductController],
  exports: [EstoqueDatabaseModule, GetProductUseCase],
})
export class ProductModule {}
