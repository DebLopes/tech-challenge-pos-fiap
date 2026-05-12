import { ConflictException, Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '../../../domain/entities/user';
import type { UserRepositoryInterface } from '../../../domain/repositories/user.repository';
import { USER_REPOSITORY } from '../../../domain/repositories/tokens';
import type { CreateUserInput } from './create-user-input';

const SALT_ROUNDS = 10;

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepositoryInterface,
  ) {}

  async execute(
    input: CreateUserInput,
  ): Promise<{ id: string; email: string }> {
    const email = input.email.toLowerCase();
    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new ConflictException('Email já cadastrado');
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const user = User.create({
      name: input.name,
      email,
      passwordHash,
      role: input.role,
      active: input.active ?? true,
    });

    const saved = await this.users.create(user);
    return { id: saved.id, email: saved.email };
  }
}
