import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import type { ServiceOrder } from '../../../../domain/entities/service-order';
import { ServiceOrderStatus } from '../../../../domain/entities/service-order-status';
import {
  ServiceOrderPartLineConverter,
  ServiceOrderServiceLineConverter,
  StatusHistoryEntryConverter,
} from '../converters/service-order.converters';
import { BudgetResponseDto } from './budget-response.dto';
import { ServiceOrderClientSnapshotResponseDto } from './service-order-client-snapshot-response.dto';
import { ServiceOrderPartLineResponseDto } from './service-order-part-line-response.dto';
import { ServiceOrderServiceLineResponseDto } from './service-order-service-line-response.dto';
import { ServiceOrderVehicleSnapshotResponseDto } from './service-order-vehicle-snapshot-response.dto';
import { StatusHistoryEntryResponseDto } from './status-history-entry-response.dto';

export class ServiceOrderResponseDto {
  @ApiProperty({
    description: 'Identificador da ordem de serviço',
    example: 'c0a8012a-3f2b-4a6b-bb8f-8a4d5b5f1f2e',
  })
  @IsString()
  declare id: string;

  @ApiProperty({
    description: 'Status atual da ordem de serviço',
    enum: ServiceOrderStatus,
    example: ServiceOrderStatus.IN_DIAGNOSIS,
  })
  @IsEnum(ServiceOrderStatus)
  declare status: ServiceOrderStatus;

  @ApiProperty({
    description: 'Cliente (snapshot gravado na OS)',
    type: ServiceOrderClientSnapshotResponseDto,
  })
  @ValidateNested()
  @Type(() => ServiceOrderClientSnapshotResponseDto)
  declare client: ServiceOrderClientSnapshotResponseDto;

  @ApiProperty({
    description: 'Veículo (snapshot gravado na OS)',
    type: ServiceOrderVehicleSnapshotResponseDto,
  })
  @ValidateNested()
  @Type(() => ServiceOrderVehicleSnapshotResponseDto)
  declare vehicle: ServiceOrderVehicleSnapshotResponseDto;

  @ApiPropertyOptional({
    description: 'Descrição livre inicial do que o cliente solicitou',
    example: 'Cliente reclama de barulho',
  })
  @IsOptional()
  @IsString()
  declare requestedServicesDescription?: string;

  @ApiPropertyOptional({
    description: 'Diagnóstico registrado pela oficina',
    example: 'Verificado sistema de suspensão, sem rupturas.',
  })
  @IsOptional()
  @IsString()
  declare diagnosis?: string;

  @ApiProperty({
    description: 'Linhas de serviço adicionadas na OS',
    type: [ServiceOrderServiceLineResponseDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceOrderServiceLineResponseDto)
  declare serviceLines: ServiceOrderServiceLineResponseDto[];

  @ApiProperty({
    description: 'Linhas de peças avulsas adicionadas na OS',
    type: [ServiceOrderPartLineResponseDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceOrderPartLineResponseDto)
  declare partLines: ServiceOrderPartLineResponseDto[];

  @ApiPropertyOptional({
    description: 'Orçamento gerado (quando existir)',
    type: BudgetResponseDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BudgetResponseDto)
  declare budget?: BudgetResponseDto;

  @ApiProperty({
    description: 'Histórico de transições de status da OS',
    type: [StatusHistoryEntryResponseDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StatusHistoryEntryResponseDto)
  declare statusHistory: StatusHistoryEntryResponseDto[];

  @ApiProperty({
    description: 'Data/hora de criação',
    example: '2026-05-04T18:00:00.000Z',
  })
  @IsDate()
  declare createdAt: Date;

  @ApiProperty({
    description: 'Data/hora da última atualização',
    example: '2026-05-04T18:10:00.000Z',
  })
  @IsDate()
  declare updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Data/hora de início da execução (quando aplicável)',
    example: '2026-05-04T18:30:00.000Z',
  })
  @IsOptional()
  @IsDate()
  declare startedAt?: Date;

  @ApiPropertyOptional({
    description: 'Data/hora de finalização da execução (quando aplicável)',
    example: '2026-05-04T19:30:00.000Z',
  })
  @IsOptional()
  @IsDate()
  declare finishedAt?: Date;

  @ApiPropertyOptional({
    description: 'Data/hora de entrega do veículo (quando aplicável)',
    example: '2026-05-04T20:00:00.000Z',
  })
  @IsOptional()
  @IsDate()
  declare deliveredAt?: Date;
  @ApiPropertyOptional({
    description: 'Motivo quando a OS foi cancelada (ex.: orçamento reprovado)',
  })
  @IsOptional()
  @IsString()
  declare cancellationReason?: string;

  constructor(partial: Partial<ServiceOrderResponseDto>) {
    Object.assign(this, partial);
  }

  static toDto(order: ServiceOrder): ServiceOrderResponseDto {
    const client = new ServiceOrderClientSnapshotResponseDto();
    client.id = order.clientId;
    client.document = order.clientDocument;
    client.name = order.clientName;
    const vehicle = new ServiceOrderVehicleSnapshotResponseDto();
    vehicle.id = order.vehicleId;
    vehicle.plate = order.vehiclePlate;
    vehicle.brand = order.vehicleBrand;
    vehicle.model = order.vehicleModel;
    vehicle.year = order.vehicleYear;
    return new ServiceOrderResponseDto({
      id: order.id,
      status: order.status,
      client,
      vehicle,
      requestedServicesDescription: order.requestedServicesDescription,
      diagnosis: order.diagnosis,
      serviceLines: order.serviceLines.map((l) =>
        ServiceOrderServiceLineConverter.toDto(l),
      ),
      partLines: order.partLines.map((p) =>
        ServiceOrderPartLineConverter.toDto(p),
      ),
      budget: order.budget ? BudgetResponseDto.toDto(order.budget) : undefined,
      statusHistory: order.statusHistory.map((h) =>
        StatusHistoryEntryConverter.toDto(h),
      ),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      startedAt: order.startedAt,
      finishedAt: order.finishedAt,
      deliveredAt: order.deliveredAt,
      cancellationReason: order.cancellationReason,
    });
  }
}
