import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'node:crypto';
import { describe, expect, it } from '@jest/globals';
import * as bcrypt from 'bcrypt';
import { User } from '../../../domain/entities/user';
import { UserRole } from '../../../domain/entities/user-role';
import type { UserRepositoryInterface } from '../../../domain/repositories/user.repository';
import { CreateUserUseCase } from './create-user';
import { LoginUseCase } from './login';
import { ValidateUserUseCase } from './validate-user';
import type { JwtPayload } from './jwt-payload';

class InMemoryUserRepository implements UserRepositoryInterface {
  private readonly byEmail = new Map<string, User>();
  private readonly byId = new Map<string, User>();

  async create(data: User): Promise<User> {
    this.byEmail.set(data.email.toLowerCase(), data);
    this.byId.set(data.id, data);
    return data;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.byEmail.get(email.toLowerCase()) ?? null;
  }

  async findById(id: string): Promise<User | null> {
    return this.byId.get(id) ?? null;
  }
}

describe('Auth use cases', () => {
  const validPassword = randomBytes(16).toString('base64url');
  const alternatePassword = randomBytes(16).toString('base64url');

  it('create-user keeps email lowercase and hashes password', async () => {
    const repo = new InMemoryUserRepository();
    const useCase = new CreateUserUseCase(repo);

    const result = await useCase.execute({
      name: 'Admin',
      email: 'Admin@Test.COM',
      password: validPassword,
      role: UserRole.ADMIN,
    });

    expect(result.email).toBe('admin@test.com');
    const stored = await repo.findByEmail('admin@test.com');
    expect(stored).not.toBeNull();
    expect(await bcrypt.compare(validPassword, stored!.passwordHash)).toBe(
      true,
    );
  });

  it('create-user rejects duplicate email', async () => {
    const repo = new InMemoryUserRepository();
    const useCase = new CreateUserUseCase(repo);

    await useCase.execute({
      name: 'A',
      email: 'dup@test.com',
      password: validPassword,
      role: UserRole.ADMIN,
    });

    await expect(
      useCase.execute({
        name: 'B',
        email: 'dup@test.com',
        password: alternatePassword,
        role: UserRole.ATENDENTE,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('login returns JWT string', async () => {
    const repo = new InMemoryUserRepository();
    const hash = await bcrypt.hash(validPassword, 4);
    await repo.create(
      User.create({
        name: 'X',
        email: 'x@test.com',
        passwordHash: hash,
        role: UserRole.ADMIN,
        active: true,
      }),
    );

    const jwt = {
      signAsync: async () => 'signed-token',
    } as unknown as JwtService;

    const useCase = new LoginUseCase(repo, jwt);
    const out = await useCase.execute({
      email: 'x@test.com',
      password: validPassword,
    });

    expect(out.access_token).toBe('signed-token');
  });

  it('login rejects wrong password', async () => {
    const repo = new InMemoryUserRepository();
    const hash = await bcrypt.hash(validPassword, 4);
    await repo.create(
      User.create({
        name: 'X',
        email: 'x@test.com',
        passwordHash: hash,
        role: UserRole.ADMIN,
        active: true,
      }),
    );

    const jwt = {
      signAsync: async () => 'should-not-call',
    } as unknown as JwtService;

    const useCase = new LoginUseCase(repo, jwt);
    await expect(
      useCase.execute({
        email: 'x@test.com',
        password: randomBytes(16).toString('base64url'),
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('validate-user rejects inactive user', async () => {
    const repo = new InMemoryUserRepository();
    const user = User.create({
      name: 'X',
      email: 'x@test.com',
      passwordHash: 'h',
      role: UserRole.ADMIN,
      active: false,
    });
    await repo.create(user);

    const useCase = new ValidateUserUseCase(repo);
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    await expect(useCase.execute(payload)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('validate-user returns authenticated shape when active', async () => {
    const repo = new InMemoryUserRepository();
    const user = User.create({
      name: 'X',
      email: 'x@test.com',
      passwordHash: 'h',
      role: UserRole.MECANICO,
      active: true,
    });
    await repo.create(user);

    const useCase = new ValidateUserUseCase(repo);
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    await expect(useCase.execute(payload)).resolves.toEqual({
      sub: user.id,
      email: user.email,
      role: UserRole.MECANICO,
    });
  });
});
