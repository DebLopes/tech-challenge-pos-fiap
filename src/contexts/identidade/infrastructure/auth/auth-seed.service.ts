import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConflictError } from '../../../shared/domain/errors';
import { CreateUserUseCase } from '../../application/use-case/auth/create-user';
import { UserRole } from '../../domain/entities/user-role';

@Injectable()
export class AuthSeedService implements OnModuleInit {
  private readonly logger = new Logger(AuthSeedService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly createUser: CreateUserUseCase,
  ) {}

  async onModuleInit(): Promise<void> {
    const email = this.config.get<string>('SEED_ADMIN_EMAIL')?.trim();
    const password = this.config.get<string>('SEED_ADMIN_PASSWORD');
    if (!email || !password) {
      return;
    }

    const name = this.config.get<string>('SEED_ADMIN_NAME') ?? 'Admin';
    const roleRaw = this.config.get<string>('SEED_ADMIN_ROLE');
    const role =
      roleRaw && (Object.values(UserRole) as string[]).includes(roleRaw)
        ? (roleRaw as UserRole)
        : UserRole.ADMIN;

    try {
      await this.createUser.execute({
        name,
        email,
        password,
        role,
        active: true,
      });
      this.logger.log(
        `Usuário inicial criado a partir de SEED_ADMIN_* (${email})`,
      );
    } catch (e) {
      if (e instanceof ConflictError) {
        this.logger.log(`Seed: email ${email} já cadastrado.`);
        return;
      }
      throw e;
    }
  }
}
