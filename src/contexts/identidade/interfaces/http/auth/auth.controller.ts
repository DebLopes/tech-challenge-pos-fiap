import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserUseCase } from '../../../application/use-case/auth/create-user';
import { LoginUseCase } from '../../../application/use-case/auth/login';
import { UserRole } from '../../../domain/entities/user-role';
import { AuthRoles } from './decorators/auth-roles.decorator';
import { CreateUserRequestDto } from './dtos/create-user-request.dto';
import { LoginRequestDto } from './dtos/login-request.dto';
import { LoginResponseDto } from './dtos/login-response.dto';

@ApiTags('Identidade / Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly login: LoginUseCase,
  ) {}

  @Post('users')
  @HttpCode(201)
  @AuthRoles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cadastrar usuário (apenas admin)',
    description:
      'Cria atendente, mecânico ou outro admin. Exige JWT de usuário com papel `admin`.',
  })
  @ApiResponse({ status: 201 })
  register(
    @Body() dto: CreateUserRequestDto,
  ): Promise<{ id: string; email: string }> {
    return this.createUser.execute({
      name: dto.name,
      email: dto.email,
      password: dto.password,
      role: dto.role,
      active: dto.active,
    });
  }

  @Post('login')
  @ApiOperation({ summary: 'Login — retorna JWT' })
  @ApiResponse({ status: 200, type: LoginResponseDto })
  async authenticate(@Body() dto: LoginRequestDto): Promise<LoginResponseDto> {
    return this.login.execute({
      email: dto.email,
      password: dto.password,
    });
  }
}
