import { ApiProperty } from '@nestjs/swagger';
import type { LoginResult } from '../../../../application/use-case/auth/login';

export class LoginResponseDto {
  @ApiProperty()
  declare access_token: string;

  constructor(partial: Partial<LoginResponseDto> = {}) {
    Object.assign(this, partial);
  }

  static toDto(result: LoginResult): LoginResponseDto {
    return new LoginResponseDto({ access_token: result.access_token });
  }
}
