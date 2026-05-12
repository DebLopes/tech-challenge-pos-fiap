import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { UserRepositoryInterface } from '../../../domain/repositories/user.repository';
import { USER_REPOSITORY } from '../../../domain/repositories/tokens';
import type { JwtPayload } from './jwt-payload';

@Injectable()
export class ValidateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepositoryInterface,
  ) {}

  async execute(payload: JwtPayload): Promise<JwtPayload> {
    const user = await this.users.findById(payload.sub);
    if (!user?.active) {
      throw new UnauthorizedException();
    }

    return {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
