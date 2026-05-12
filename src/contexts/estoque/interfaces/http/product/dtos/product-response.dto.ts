import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import type { Product } from '../../../../domain/entities/product';

export class ProductResponseDto {
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
  code: string;

  @ApiProperty({
    description: 'Descrição opcional do produto',
    example:
      'Essencial no sistema de admissão que retém impurezas como poeira e fuligem',
  })
  @IsString()
  @IsOptional()
  description?: string;

  constructor(partial: Partial<ProductResponseDto>) {
    Object.assign(this, partial);
  }

  static toDto(product: Product): ProductResponseDto {
    return new ProductResponseDto({
      code: product.code,
      name: product.name,
      description: product.description,
    });
  }
}
