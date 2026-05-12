import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class AddPartToOrderRequestDto {
  @ApiProperty({
    description: 'Código do produto/peça',
    example: 'OLEO01',
  })
  @IsString()
  @IsNotEmpty()
  declare productCode: string;

  @ApiProperty({
    description: 'Quantidade da peça a ser adicionada na OS',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  declare quantity: number;
}
