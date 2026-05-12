import { ApiProperty } from '@nestjs/swagger';
import { ServiceOrderStatus } from '../../../../domain/entities/service-order-status';

export class PublicBudgetDecisionResponseDto {
  @ApiProperty({ enum: ServiceOrderStatus })
  declare status: ServiceOrderStatus;

  static fromStatus(
    status: ServiceOrderStatus,
  ): PublicBudgetDecisionResponseDto {
    const dto = new PublicBudgetDecisionResponseDto();
    dto.status = status;
    return dto;
  }
}
