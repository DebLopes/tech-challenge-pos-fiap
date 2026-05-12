import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { CatalogServiceDefaultPartDto } from './catalog-service-default-part.dto';

export class CreateCatalogServiceRequestDto {
  @ApiProperty({
    description: 'Nome do serviço do catálogo',
    example: 'Troca de óleo',
  })
  @IsString()
  @IsNotEmpty()
  declare name: string;

  @ApiPropertyOptional({
    description: 'Descrição opcional do serviço',
    example: 'Inclui filtro quando cadastrado nas pecas padrao',
  })
  @IsString()
  @IsOptional()
  declare description?: string;

  @ApiProperty({
    description: 'Preço base de mão de obra do serviço',
    example: 120.5,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  declare basePrice: number;

  @ApiPropertyOptional({
    description: 'Indica se o serviço está ativo para uso em novas OS',
    default: true,
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  declare active?: boolean;

  @ApiPropertyOptional({
    type: [CatalogServiceDefaultPartDto],
    description:
      'Insumos padrao do servico (precos de pecas entram no orcamento)',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CatalogServiceDefaultPartDto)
  @IsOptional()
  declare defaultParts?: CatalogServiceDefaultPartDto[];
}
