import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import type { PublicServiceOrderStatusItemResult } from '../../../../application/use-case/service-order/public-service-order-status.result';
import { PublicServiceOrderStatusItemDto } from './public-service-order-status-item.dto';

export class PublicServiceOrderStatusResponseDto {
  @ApiProperty({
    description: 'Lista de ordens de serviço em aberto para o cliente',
    type: [PublicServiceOrderStatusItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PublicServiceOrderStatusItemDto)
  declare items: PublicServiceOrderStatusItemDto[];

  constructor(items: PublicServiceOrderStatusItemDto[]) {
    this.items = items;
  }

  static toDto(
    rows: PublicServiceOrderStatusItemResult[],
  ): PublicServiceOrderStatusResponseDto {
    return new PublicServiceOrderStatusResponseDto(
      rows.map(
        (row) =>
          new PublicServiceOrderStatusItemDto({
            serviceOrderId: row.serviceOrderId,
            vehiclePlate: row.vehiclePlate,
            status: row.status,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            budgetTotal: row.budgetTotal,
            budgetApproved: row.budgetApproved,
            startedAt: row.startedAt,
            finishedAt: row.finishedAt,
          }),
      ),
    );
  }
}
