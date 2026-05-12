import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class ServiceLineDefaultPartResponseDto {
  @ApiProperty({
    description: 'Código do produto (peça/insumo)',
    example: 'OLEO01',
  })
  @IsString()
  @IsNotEmpty()
  declare productCode: string;

  @ApiProperty({
    description: 'Nome da peça/insumo',
    example: 'Óleo 5W30',
  })
  @IsString()
  @IsNotEmpty()
  declare name: string;

  @ApiProperty({
    description: 'Quantidade do insumo usada por unidade do serviço',
    example: 4,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  declare quantity: number;
}
