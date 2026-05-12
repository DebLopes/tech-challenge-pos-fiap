import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import type { CatalogService } from '../../../../domain/entities/catalog-service';
import { CatalogServiceDefaultPartResponseDto } from './catalog-service-default-part-response.dto';

export class CatalogServiceResponseDto {
  @ApiProperty({
    description: 'Identificador do serviço do catálogo',
    example: '8dab6eb7-09a2-44bc-b93e-260f67258e3c',
  })
  @IsString()
  @IsNotEmpty()
  declare id: string;

  @ApiProperty({
    description: 'Nome do serviço do catálogo',
    example: 'Troca de óleo',
  })
  @IsString()
  @IsNotEmpty()
  declare name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description:
      'Preço da mão de obra do serviço (peças entram no orçamento via defaultParts e/ou peças avulsas na OS)',
    example: 120,
  })
  @IsNumber()
  declare basePrice: number;

  @ApiProperty({
    description: 'Indica se o serviço está ativo para uso em novas OS',
    example: true,
  })
  @IsBoolean()
  declare active: boolean;

  @ApiProperty({
    description: 'Lista de peças/insumos padrão associadas ao serviço',
    type: [CatalogServiceDefaultPartResponseDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CatalogServiceDefaultPartResponseDto)
  declare defaultParts: CatalogServiceDefaultPartResponseDto[];

  constructor(partial: Partial<CatalogServiceResponseDto>) {
    Object.assign(this, partial);
  }

  static toDto(service: CatalogService): CatalogServiceResponseDto {
    return new CatalogServiceResponseDto({
      id: service.id,
      name: service.name,
      description: service.description,
      basePrice: service.basePrice,
      active: service.active,
      defaultParts: service.defaultParts.map((p) => ({
        productCode: p.productCode,
        quantity: p.quantity,
      })),
    });
  }
}
