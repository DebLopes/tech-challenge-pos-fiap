import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateProductBatchDto {
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
    minimum: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  declare quantity: number;

  @ApiProperty({
    description:
      'Preço de custo do produto (valor pago para aquisição ou produção)',
    example: 50.0,
  })
  @IsNumber()
  @IsNotEmpty()
  declare costPrice: number;

  @ApiProperty({
    description: 'Preço de venda do produto (valor cobrado do cliente)',
    example: 90.0,
  })
  @IsNumber()
  @IsNotEmpty()
  declare salePrice: number;

  constructor(partial: Partial<CreateProductBatchDto>) {
    Object.assign(this, partial);
  }
}
