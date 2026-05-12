import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { CatalogServiceDefaultPartDto } from './catalog-service-default-part.dto';

export class UpdateCatalogServiceRequestDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  basePrice?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @ApiPropertyOptional({ type: [CatalogServiceDefaultPartDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CatalogServiceDefaultPartDto)
  @IsOptional()
  defaultParts?: CatalogServiceDefaultPartDto[];
}
