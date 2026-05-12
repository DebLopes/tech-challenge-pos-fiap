import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CatalogServiceDefaultPartDto {
  @ApiProperty({
    description: 'Código do produto (peça/insumo) usado como padrão no serviço',
    example: 'OLEO01',
  })
  @IsString()
  @IsNotEmpty()
  declare productCode: string;

  @ApiProperty({
    description: 'Quantidade do insumo padrão por unidade do serviço',
    example: 4,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  declare quantity: number;
}
