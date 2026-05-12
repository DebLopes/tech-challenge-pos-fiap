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
  CreateCatalogServiceUseCase,
  DeleteCatalogServiceUseCase,
  GetAllCatalogServicesUseCase,
  GetCatalogServiceUseCase,
  UpdateCatalogServiceUseCase,
} from '../../../application/use-case/catalog-service';
import { UserRole } from '../../../../identidade/domain/entities/user-role';
import { AuthRoles } from '../../../../identidade/interfaces/http/auth/decorators/auth-roles.decorator';
import { CatalogServiceResponseDto } from './dtos/catalog-service-response.dto';
import { CreateCatalogServiceRequestDto } from './dtos/create-catalog-service-request.dto';
import { UpdateCatalogServiceRequestDto } from './dtos/update-catalog-service-request.dto';

@ApiTags('Ordem de Serviço / Catálogo de Serviços')
@ApiBearerAuth()
@Controller('services')
export class CatalogServiceController {
  constructor(
    private readonly createCatalogService: CreateCatalogServiceUseCase,
    private readonly getAllCatalogServices: GetAllCatalogServicesUseCase,
    private readonly getCatalogService: GetCatalogServiceUseCase,
    private readonly updateCatalogService: UpdateCatalogServiceUseCase,
    private readonly deleteCatalogService: DeleteCatalogServiceUseCase,
  ) {}

  @Post()
  @AuthRoles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Cadastrar servico do catalogo (template para OS)' })
  @ApiResponse({ status: 201, type: CatalogServiceResponseDto })
  async create(
    @Body() dto: CreateCatalogServiceRequestDto,
  ): Promise<CatalogServiceResponseDto> {
    const entity = await this.createCatalogService.execute(dto);
    return CatalogServiceResponseDto.toDto(entity);
  }

  @Get()
  @AuthRoles(UserRole.ADMIN, UserRole.ATENDENTE, UserRole.MECANICO)
  @ApiOperation({ summary: 'Listar servicos do catalogo' })
  @ApiResponse({ status: 200, type: [CatalogServiceResponseDto] })
  async findAll(): Promise<CatalogServiceResponseDto[]> {
    const list = await this.getAllCatalogServices.execute();
    return list.map((s) => CatalogServiceResponseDto.toDto(s));
  }

  @Get(':id')
  @AuthRoles(UserRole.ADMIN, UserRole.ATENDENTE, UserRole.MECANICO)
  @ApiOperation({ summary: 'Obter servico do catalogo por id' })
  @ApiResponse({ status: 200, type: CatalogServiceResponseDto })
  async findOne(@Param('id') id: string): Promise<CatalogServiceResponseDto> {
    const doc = await this.getCatalogService.execute(id);
    return CatalogServiceResponseDto.toDto(doc);
  }

  @Patch(':id')
  @AuthRoles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualizar servico do catalogo' })
  @ApiResponse({ status: 200, type: CatalogServiceResponseDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCatalogServiceRequestDto,
  ): Promise<CatalogServiceResponseDto> {
    const updated = await this.updateCatalogService.execute(id, {
      name: dto.name,
      description: dto.description,
      basePrice: dto.basePrice,
      active: dto.active,
      defaultParts: dto.defaultParts,
    });
    return CatalogServiceResponseDto.toDto(updated);
  }

  @Delete(':id')
  @AuthRoles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Remover servico do catalogo' })
  @ApiResponse({ status: 200 })
  async remove(@Param('id') id: string): Promise<{ ok: true }> {
    await this.deleteCatalogService.execute(id);
    return { ok: true };
  }
}
