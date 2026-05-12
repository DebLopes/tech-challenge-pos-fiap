import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CatalogServiceDefaultPartResponseDto {
  @ApiProperty({
    description: 'Código do produto usado como peça/insumo padrão do serviço',
    example: 'OLEO01',
  })
  @IsString()
  @IsNotEmpty()
  declare productCode: string;

  @ApiProperty({
    description: 'Quantidade do produto (insumo) usada por unidade do serviço',
    example: 4,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  declare quantity: number;
}
