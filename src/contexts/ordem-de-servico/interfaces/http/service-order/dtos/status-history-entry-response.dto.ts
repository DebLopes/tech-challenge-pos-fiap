import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceOrderStatus } from '../../../../domain/entities/service-order-status';
import { IsDate, IsEnum, IsOptional } from 'class-validator';

export class StatusHistoryEntryResponseDto {
  @ApiPropertyOptional({
    description: 'Status anterior (null quando a OS é criada)',
    enum: ServiceOrderStatus,
    nullable: true,
    example: 'RECEIVED',
  })
  @IsOptional()
  @IsEnum(ServiceOrderStatus)
  declare from: ServiceOrderStatus | null;

  @ApiProperty({
    description: 'Status de destino',
    enum: ServiceOrderStatus,
    example: 'IN_DIAGNOSIS',
  })
  @IsEnum(ServiceOrderStatus)
  declare to: ServiceOrderStatus;

  @ApiProperty({
    description: 'Data/hora da transição de status',
    example: '2026-05-04T18:05:00.000Z',
  })
  @IsDate()
  declare at: Date;
}
