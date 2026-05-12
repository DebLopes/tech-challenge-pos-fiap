import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ServiceLineDefaultPartResponseDto } from './service-line-default-part-response.dto';

export class ServiceOrderServiceLineResponseDto {
  @ApiProperty({
    description: 'Identificador da linha de serviço na OS',
    example: 'bbf5b079-2f0b-4c17-96a2-f0c9d0a2a1b0',
  })
  @IsString()
  @IsNotEmpty()
  declare id: string;

  @ApiProperty({
    description: 'Identificador do serviço do catálogo',
    example: '8dab6eb7-09a2-44bc-b93e-260f67258e3c',
  })
  @IsString()
  @IsNotEmpty()
  declare catalogServiceId: string;

  @ApiProperty({
    description: 'Nome do serviço (snapshot na OS)',
    example: 'Troca de óleo',
  })
  @IsString()
  @IsNotEmpty()
  declare name: string;

  @ApiProperty({
    description: 'Preço unitário do serviço aplicado na OS (snapshot)',
    example: 120,
  })
  @IsNumber()
  declare unitPrice: number;

  @ApiProperty({
    description: 'Quantidade do serviço na OS',
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  declare quantity: number;

  @ApiProperty({
    description: 'Peças/insumos padrão do serviço (snapshot na OS)',
    type: [ServiceLineDefaultPartResponseDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceLineDefaultPartResponseDto)
  declare defaultParts: ServiceLineDefaultPartResponseDto[];
}
