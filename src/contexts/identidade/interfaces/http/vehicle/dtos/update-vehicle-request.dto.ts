import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateVehicleDto {
  @ApiProperty({
    description: 'Modelo do veículo',
    example: 'HR-V',
  })
  @IsString()
  @IsOptional()
  model?: string;

  @ApiProperty({
    description: 'Marca do veículo',
    example: 'Honda',
  })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiProperty({
    description: 'Ano de fabricação do veículo',
    example: 2026,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  year?: number;

  constructor(partial: Partial<UpdateVehicleDto>) {
    Object.assign(this, partial);
  }
}
