import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class AddServiceToOrderRequestDto {
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
