import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateVehicleUseCase,
  DeleteVehicleUseCase,
  GetAllVehiclesUseCase,
  GetVehicleUseCase,
  UpdatedVehicleUseCase,
} from '../../../application/use-case/vehicle';
import { UserRole } from '../../../domain/entities/user-role';
import { AuthRoles } from '../auth/decorators/auth-roles.decorator';
import { CreateVehicleDto } from './dtos/create-vehicle.dto';
import { UpdateVehicleDto } from './dtos/update-vehicle-request.dto';
import { VehicleResponseDto } from './dtos/vehicle-response.dto';

@ApiTags('Identidade / Veículos')
@ApiBearerAuth()
@Controller('vehicle')
export class VehicleController {
  constructor(
    private readonly createVehicleUseCase: CreateVehicleUseCase,
    private readonly getAllVehiclesUseCase: GetAllVehiclesUseCase,
    private readonly getVehicleUseCase: GetVehicleUseCase,
    private readonly updateVehicleUseCase: UpdatedVehicleUseCase,
    private readonly deleteVehicleUseCase: DeleteVehicleUseCase,
  ) {}

  @Post()
  @AuthRoles(UserRole.ADMIN, UserRole.ATENDENTE)
  async create(@Body() dto: CreateVehicleDto): Promise<VehicleResponseDto> {
    const vehicle = await this.createVehicleUseCase.execute({
      plate: dto.plate,
      model: dto.model,
      brand: dto.brand,
      year: dto.year,
    });
    return VehicleResponseDto.toDto(vehicle);
  }

  @Get()
  @AuthRoles(UserRole.ADMIN, UserRole.ATENDENTE, UserRole.MECANICO)
  @ApiOperation({
    summary: 'Listar veículos',
    description: 'Ordenação: data de cadastro (mais recentes primeiro).',
  })
  @ApiResponse({ status: 200, type: [VehicleResponseDto] })
  async findAll(): Promise<VehicleResponseDto[]> {
    const list = await this.getAllVehiclesUseCase.execute();
    return list.map((v) => VehicleResponseDto.toDto(v));
  }

  @Get(':plate')
  @AuthRoles(UserRole.ADMIN, UserRole.ATENDENTE, UserRole.MECANICO)
  async findOne(@Param('plate') plate: string): Promise<VehicleResponseDto> {
    const vehicle = await this.getVehicleUseCase.execute(plate);
    return VehicleResponseDto.toDto(vehicle);
  }

  @Patch(':plate')
  @AuthRoles(UserRole.ADMIN, UserRole.ATENDENTE)
  async update(
    @Param('plate') plate: string,
    @Body() data: UpdateVehicleDto,
  ): Promise<VehicleResponseDto> {
    const vehicle = await this.updateVehicleUseCase.execute(plate, {
      model: data.model,
      brand: data.brand,
      year: data.year,
    });
    return VehicleResponseDto.toDto(vehicle);
  }

  @Delete(':plate')
  @AuthRoles(UserRole.ADMIN)
  remove(@Param('plate') document: string) {
    return this.deleteVehicleUseCase.execute(document);
  }
}
