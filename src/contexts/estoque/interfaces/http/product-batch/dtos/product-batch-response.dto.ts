import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import type { CreateProductBatchResult } from '../../../../application/use-case/product-batch/create-product-batch';
import type { ProductBatchListRow } from '../../../../application/use-case/product-batch/get-product-batch';
import type { ProductBatch } from '../../../../domain/entities/product-batch';

export class ProductBatchResponseDto {
  @ApiProperty({
    description: 'Nome do produto',
    example: 'Filtro de ar',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Codigo único do produto',
    example: 'FILTRODEAR01 ou PROD01',
  })
  @IsString()
  productCode: string;

  @ApiProperty({
    description: 'Quantidade do produto',
    example: 20,
  })
  quantity: number;

  @ApiProperty({
    description:
      'Preço de custo do produto (valor pago para aquisição ou produção)',
    example: 50.0,
  })
  @IsNumber()
  costPrice: number;

  @ApiProperty({
    description: 'Preço de venda do produto (valor cobrado do cliente)',
    example: 90.0,
  })
  @IsNumber()
  salePrice: number;

  constructor(partial: Partial<ProductBatchResponseDto>) {
    Object.assign(this, partial);
  }

  static toDto(
    batch: ProductBatch,
    productName: string,
  ): ProductBatchResponseDto {
    return new ProductBatchResponseDto({
      name: productName,
      productCode: batch.productCode,
      quantity: batch.quantity,
      costPrice: batch.costPrice,
      salePrice: batch.salePrice,
    });
  }

  static toDtoFromCreate(
    result: CreateProductBatchResult,
  ): ProductBatchResponseDto {
    return ProductBatchResponseDto.toDto(result.batch, result.productName);
  }

  static toDtoList(rows: ProductBatchListRow[]): ProductBatchResponseDto[] {
    return rows.map((row) =>
      ProductBatchResponseDto.toDto(row.batch, row.productName),
    );
  }
}
