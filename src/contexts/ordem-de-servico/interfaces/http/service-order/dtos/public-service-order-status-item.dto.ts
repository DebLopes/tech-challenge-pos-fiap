import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import type { ServiceOrderStatus } from '../../../../domain/entities/service-order-status';

export class PublicServiceOrderStatusItemDto {
  @ApiProperty({
    description: 'Identificador da ordem de serviço',
    example: 'c0a8012a-3f2b-4a6b-bb8f-8a4d5b5f1f2e',
  })
  @IsString()
  declare serviceOrderId: string;

  @ApiProperty({
    description: 'Placa do veículo',
    example: 'MVO9884',
  })
  @IsString()
  declare vehiclePlate: string;

  @ApiProperty({
    description: 'Status atual da ordem de serviço',
    example: 'WAITING_APPROVAL',
  })
  declare status: ServiceOrderStatus;

  @ApiProperty({
    description: 'Data/hora de criação da ordem de serviço',
    example: '2026-05-04T18:00:00.000Z',
  })
  @IsDate()
  declare createdAt: Date;

  @ApiProperty({
    description: 'Data/hora da última atualização da ordem de serviço',
    example: '2026-05-04T18:10:00.000Z',
  })
  @IsDate()
  declare updatedAt: Date;

  @ApiPropertyOptional({
    description:
      'Total do orçamento (quando já gerado). Para detalhe dos itens, use a rota pública de orçamento.',
    example: 380,
  })
  @IsOptional()
  @IsNumber()
  declare budgetTotal?: number;

  @ApiProperty({
    description: 'Indica se o orçamento já foi aprovado',
    example: false,
  })
  @IsBoolean()
  declare budgetApproved: boolean;

  @ApiPropertyOptional({
    description: 'Data/hora em que a execução foi iniciada (quando aplicável)',
    example: '2026-05-04T18:30:00.000Z',
  })
  @IsOptional()
  @IsDate()
  declare startedAt?: Date;

  @ApiPropertyOptional({
    description:
      'Data/hora em que a execução foi finalizada (quando aplicável)',
    example: '2026-05-04T19:30:00.000Z',
  })
  @IsOptional()
  @IsDate()
  declare finishedAt?: Date;

  constructor(partial: Partial<PublicServiceOrderStatusItemDto>) {
    Object.assign(this, partial);
  }
}
