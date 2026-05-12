import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateProductDto {
  @ApiProperty({
    description: 'Nome do produto',
    example: 'Filtro de ar',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Descrição opcional do produto',
    example:
      'Essencial no sistema de admissão que retém impurezas como poeira e fuligem',
  })
  @IsString()
  @IsOptional()
  description?: string;

  constructor(partial: Partial<UpdateProductDto>) {
    Object.assign(this, partial);
  }
}
