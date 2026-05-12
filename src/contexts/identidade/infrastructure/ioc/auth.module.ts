import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, type JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import {
  CreateUserUseCase,
  LoginUseCase,
  ValidateUserUseCase,
} from '../../application/use-case/auth';
import { AuthSeedService } from '../auth/auth-seed.service';
import { IdentidadeDatabaseModule } from '../database/database.module';
import { AuthController } from '../../interfaces/http/auth/auth.controller';
import { JwtStrategy } from '../../interfaces/http/auth/strategies/jwt.strategy';

@Global()
@Module({
  imports: [
    IdentidadeDatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET is not set');
        }
        const expiresIn = (config.get<string>('JWT_EXPIRES_IN') ??
          '1d') as JwtSignOptions['expiresIn'];
        return {
          secret,
          signOptions: { expiresIn },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    CreateUserUseCase,
    AuthSeedService,
    LoginUseCase,
    ValidateUserUseCase,
  ],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
