import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import type { Budget } from '../../../../domain/entities/service-order';
import { BudgetConverter } from '../converters/service-order.converters';
import { BudgetItemResponseDto } from './budget-item-response.dto';

export class BudgetResponseDto {
  @ApiProperty({
    description: 'Itens do orçamento (serviços e peças)',
    type: [BudgetItemResponseDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BudgetItemResponseDto)
  declare items: BudgetItemResponseDto[];

  @ApiProperty({
    description: 'Total dos serviços (somatório de linhas de serviço)',
    example: 120,
  })
  @IsNumber()
  declare servicesTotal: number;

  @ApiProperty({
    description: 'Total das peças (somatório de linhas de peças / FIFO)',
    example: 380,
  })
  @IsNumber()
  declare partsTotal: number;

  @ApiProperty({
    description: 'Total geral do orçamento (servicesTotal + partsTotal)',
    example: 500,
  })
  @IsNumber()
  declare total: number;

  @ApiProperty({
    description: 'Indica se o cliente aprovou o orçamento',
    example: false,
  })
  @IsBoolean()
  declare approved: boolean;

  @ApiPropertyOptional({
    description: 'Data/hora da aprovação do orçamento (quando aplicável)',
    example: '2026-05-04T18:20:00.000Z',
  })
  @IsOptional()
  @IsDate()
  declare approvedAt?: Date;

  static toDto(budget: Budget): BudgetResponseDto {
    return BudgetConverter.toDto(budget);
  }
}
