import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterDiagnosisRequestDto {
  @ApiProperty({
    description: 'Texto do diagnóstico realizado pela oficina',
    example: 'Diagnóstico iniciado.',
  })
  @IsString()
  @IsNotEmpty()
  declare diagnosis: string;
}
