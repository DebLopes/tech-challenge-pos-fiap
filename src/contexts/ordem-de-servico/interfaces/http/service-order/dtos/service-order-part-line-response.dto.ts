import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class ServiceOrderPartLineResponseDto {
  @ApiProperty({
    description: 'Identificador da linha de peça na OS',
    example: '7f6041e2-5f5d-4c76-9c3a-9d7c7d0a1b21',
  })
  @IsString()
  @IsNotEmpty()
  declare id: string;

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
    description: 'Quantidade solicitada na OS para a peça/insumo',
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  declare quantity: number;
}
