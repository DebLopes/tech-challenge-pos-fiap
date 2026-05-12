import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class BudgetItemResponseDto {
  @ApiProperty({
    description: 'Tipo do item do orçamento',
    enum: ['SERVICE', 'PART'],
    example: 'SERVICE',
  })
  @IsIn(['SERVICE', 'PART'])
  declare type: 'SERVICE' | 'PART';

  @ApiProperty({
    description: 'Identificador do serviço (id) ou do produto (código)',
    example: 'OLEO01',
  })
  @IsString()
  @IsNotEmpty()
  declare referenceId: string;

  @ApiProperty({
    description: 'Descrição do item (nome do serviço ou da peça)',
    example: 'Troca de óleo',
  })
  @IsString()
  @IsNotEmpty()
  declare description: string;

  @ApiProperty({
    description: 'Quantidade do item',
    example: 2,
  })
  @IsNumber()
  @IsNotEmpty()
  declare quantity: number;

  @ApiProperty({
    description: 'Preço unitário aplicado no orçamento',
    example: 55.5,
  })
  @IsNumber()
  @IsNotEmpty()
  declare unitPrice: number;

  @ApiProperty({
    description: 'Total do item (quantidade × preço unitário)',
    example: 111,
  })
  @IsNumber()
  @IsNotEmpty()
  declare total: number;
}
