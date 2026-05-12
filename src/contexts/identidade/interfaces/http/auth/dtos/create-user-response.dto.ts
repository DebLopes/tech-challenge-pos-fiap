import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export type CreateUserResult = {
  id: string;
  email: string;
};

export class CreateUserResponseDto {
  @ApiProperty({
    description: 'Identificador do usuário criado',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsString()
  declare id: string;

  @ApiProperty({
    description: 'Email do usuário criado',
    example: 'admin@oficina.com',
  })
  @IsEmail()
  declare email: string;

  constructor(partial: Partial<CreateUserResponseDto> = {}) {
    Object.assign(this, partial);
  }

  static toDto(result: CreateUserResult): CreateUserResponseDto {
    return new CreateUserResponseDto({ id: result.id, email: result.email });
  }
}
