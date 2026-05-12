import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';
import type {
  AverageExecutionBreakdownItem,
  AverageExecutionTimeResult,
} from '../../../../application/use-case/service-order/average-execution-time.result';

export class AverageExecutionBreakdownItemDto {
  @ApiProperty({
    description: 'Identificador da ordem de serviço',
    example: 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',
  })
  @IsString()
  declare serviceOrderId: string;

  @ApiProperty({
    description:
      'Duração entre startedAt e finishedAt (minutos), duas casas decimais',
    example: 42.5,
  })
  @IsNumber()
  declare executionMinutes: number;

  @ApiProperty({
    description: 'Instante em que a execução foi iniciada (domínio)',
    type: String,
    format: 'date-time',
  })
  @IsDateString()
  declare startedAt: string;

  @ApiProperty({
    description: 'Instante em que a OS foi finalizada',
    type: String,
    format: 'date-time',
  })
  @IsDateString()
  declare finishedAt: string;

  @ApiProperty({
    description: 'Placa do veículo',
    example: 'ABC1D23',
  })
  @IsString()
  declare vehiclePlate: string;

  static fromRow(
    row: AverageExecutionBreakdownItem,
  ): AverageExecutionBreakdownItemDto {
    const dto = new AverageExecutionBreakdownItemDto();
    dto.serviceOrderId = row.serviceOrderId;
    dto.executionMinutes = row.executionMinutes;
    dto.startedAt = row.startedAt.toISOString();
    dto.finishedAt = row.finishedAt.toISOString();
    dto.vehiclePlate = row.vehiclePlate;
    return dto;
  }
}

export class AverageExecutionTimeResponseDto {
  @ApiProperty({
    description:
      'Tempo médio de execução em minutos (média das OS consideradas), duas casas decimais',
    example: 42.5,
  })
  @IsNumber()
  declare averageMinutes: number;

  @ApiProperty({
    description: 'Quantidade de ordens de serviço usadas na amostra',
    example: 12,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  declare sampleSize: number;

  @ApiProperty({
    description: 'Detalhamento por OS (ordenado por id)',
    type: [AverageExecutionBreakdownItemDto],
  })
  @IsArray()
  declare items: AverageExecutionBreakdownItemDto[];

  static toDto(
    result: AverageExecutionTimeResult,
  ): AverageExecutionTimeResponseDto {
    const dto = new AverageExecutionTimeResponseDto();
    dto.averageMinutes = result.averageMinutes;
    dto.sampleSize = result.sampleSize;
    dto.items = result.items.map((row) =>
      AverageExecutionBreakdownItemDto.fromRow(row),
    );
    return dto;
  }
}
