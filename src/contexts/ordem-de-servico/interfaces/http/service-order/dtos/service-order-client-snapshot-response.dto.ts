import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ServiceOrderClientSnapshotResponseDto {
  @ApiProperty({
    description: 'Identificador do cliente (snapshot na OS)',
    example: '87042d7c-6942-4a9e-ba88-2615f5923265',
  })
  @IsString()
  @IsNotEmpty()
  declare id: string;

  @ApiProperty({
    description: 'CPF/CNPJ do cliente (snapshot na OS)',
    example: '87075443089',
  })
  @IsString()
  @IsNotEmpty()
  declare document: string;

  @ApiProperty({
    description: 'Nome do cliente (snapshot na OS)',
    example: 'Maria Teste',
  })
  @IsString()
  @IsNotEmpty()
  declare name: string;
}
