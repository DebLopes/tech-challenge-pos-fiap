import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { IsCPFOrCNPJ } from '../../../../../shared/interfaces/http/validators/is-cpf-or-cnpj.validator';
import { IsPlate } from '../../../../../shared/interfaces/http/validators/is-plate.validator';

class OpenServiceOrderClientDto {
  @ApiProperty({ description: 'Nome do cliente', example: 'João Silva' })
  @IsString()
  @IsNotEmpty()
  declare name: string;

  @ApiProperty({ description: 'Email do cliente', example: 'joao@email.com' })
  @IsEmail()
  declare email: string;

  @ApiProperty({
    description: 'CPF ou CNPJ do cliente',
    example: '12345678909',
  })
  @IsString()
  @IsNotEmpty()
  @IsCPFOrCNPJ()
  declare document: string;
}

class OpenServiceOrderVehicleDto {
  @ApiProperty({ description: 'Placa do veículo', example: 'NBK-6334' })
  @IsString()
  @IsNotEmpty()
  @IsPlate()
  declare plate: string;

  @ApiProperty({ description: 'Modelo do veículo', example: 'HR-V' })
  @IsString()
  @IsNotEmpty()
  declare model: string;

  @ApiProperty({ description: 'Marca do veículo', example: 'Honda' })
  @IsString()
  @IsNotEmpty()
  declare brand: string;

  @ApiProperty({ description: 'Ano de fabricação do veículo', example: 2024 })
  @Type(() => Number)
  @IsNumber()
  declare year: number;
}

class OpenServiceOrderServiceItemDto {
  @ApiProperty({
    description: 'Identificador do serviço do catálogo',
    example: '8dab6eb7-09a2-44bc-b93e-260f67258e3c',
  })
  @IsString()
  @IsNotEmpty()
  declare catalogServiceId: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  declare quantity?: number;
}

class OpenServiceOrderPartItemDto {
  @ApiProperty({ description: 'Código do produto/peça', example: 'OLEO01' })
  @IsString()
  @IsNotEmpty()
  declare productCode: string;

  @ApiProperty({ description: 'Quantidade da peça', example: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  declare quantity: number;
}

export class OpenServiceOrderRequestDto {
  @ApiProperty({
    description: 'Dados do cliente (reaproveitado se o documento já existir)',
    type: OpenServiceOrderClientDto,
  })
  @ValidateNested()
  @Type(() => OpenServiceOrderClientDto)
  declare client: OpenServiceOrderClientDto;

  @ApiProperty({
    description: 'Dados do veículo (reaproveitado se a placa já existir)',
    type: OpenServiceOrderVehicleDto,
  })
  @ValidateNested()
  @Type(() => OpenServiceOrderVehicleDto)
  declare vehicle: OpenServiceOrderVehicleDto;

  @ApiPropertyOptional({
    description: 'Descrição livre dos serviços solicitados pelo cliente',
    example: 'Cliente reclama de barulho na suspensão',
  })
  @IsString()
  @IsOptional()
  declare requestedServicesDescription?: string;

  @ApiPropertyOptional({
    description: 'Serviços do catálogo a vincular na abertura',
    type: [OpenServiceOrderServiceItemDto],
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => OpenServiceOrderServiceItemDto)
  declare services?: OpenServiceOrderServiceItemDto[];

  @ApiPropertyOptional({
    description: 'Peças avulsas a vincular na abertura',
    type: [OpenServiceOrderPartItemDto],
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => OpenServiceOrderPartItemDto)
  declare parts?: OpenServiceOrderPartItemDto[];
}
