import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { IsPlate } from '../../../../../shared/interfaces/http/validators/is-plate.validator';

export class ServiceOrderVehicleSnapshotResponseDto {
  @ApiProperty({
    description: 'Identificador do veículo (snapshot na OS)',
    example: '979614bc-5331-433b-b400-c5663db9055f',
  })
  @IsString()
  @IsNotEmpty()
  declare id: string;

  @ApiProperty({
    description: 'Placa do veículo (snapshot na OS)',
    example: 'MVO9884',
  })
  @IsString()
  @IsNotEmpty()
  @IsPlate()
  declare plate: string;

  @ApiProperty({
    description: 'Marca do veículo (snapshot na OS)',
    example: 'Fiat',
  })
  @IsString()
  @IsNotEmpty()
  declare brand: string;

  @ApiProperty({
    description: 'Modelo do veículo (snapshot na OS)',
    example: 'Uno',
  })
  @IsString()
  @IsNotEmpty()
  declare model: string;

  @ApiProperty({
    description: 'Ano do veículo (snapshot na OS)',
    example: 2015,
  })
  @IsNumber()
  declare year: number;
}
