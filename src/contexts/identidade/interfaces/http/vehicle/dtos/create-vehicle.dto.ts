import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { IsPlate } from '../../../../../shared/interfaces/http/validators/is-plate.validator';

export class CreateVehicleDto {
  @ApiProperty({
    description: 'Placa do veículo',
    example: 'NBK-6334',
  })
  @IsString()
  @IsNotEmpty()
  @IsPlate()
  plate: string;

  @ApiProperty({
    description: 'Modelo do veículo',
    example: 'HR-V',
  })
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiProperty({
    description: 'Marca do veículo',
    example: 'Honda',
  })
  @IsString()
  @IsNotEmpty()
  brand: string;

  @ApiProperty({
    description: 'Ano de fabricação do veículo',
    example: 2026,
  })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  year: number;

  constructor(partial: Partial<CreateVehicleDto>) {
    Object.assign(this, partial);
  }
}
