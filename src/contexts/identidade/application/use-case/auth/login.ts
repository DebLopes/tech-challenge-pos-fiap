import { Inject, Injectable } from '@nestjs/common';
import { UnauthorizedError } from '../../../../shared/domain/errors';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { UserRepositoryInterface } from '../../../domain/repositories/user.repository';
import { USER_REPOSITORY } from '../../../domain/repositories/tokens';
import type { JwtPayload } from './jwt-payload';
import type { LoginInput } from './login-input';

export type LoginResult = {
  access_token: string;
};

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepositoryInterface,
    private readonly jwt: JwtService,
  ) {}

  async execute(input: LoginInput): Promise<LoginResult> {
    const email = input.email.toLowerCase();
    const user = await this.users.findByEmail(email);
    if (!user?.active) {
      throw new UnauthorizedError('Credenciais inválidas');
    }

    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedError('Credenciais inválidas');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: await this.jwt.signAsync(payload),
    };
  }
}
