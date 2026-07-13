import {
  Body,
  Controller,
  DefaultValuePipe,
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
  AddPartToOrderUseCase,
  AddServiceToOrderUseCase,
  ApproveBudgetUseCase,
  CreateServiceOrderUseCase,
  DeliverServiceOrderUseCase,
  FinishServiceOrderUseCase,
  GenerateBudgetUseCase,
  GetAllServiceOrdersUseCase,
  GetAverageExecutionTimeUseCase,
  GetServiceOrderUseCase,
  OpenServiceOrderUseCase,
  RegisterDiagnosisUseCase,
  RejectBudgetUseCase,
} from '../../../application/use-case/service-order';
import { UserRole } from '../../../../identidade/domain/entities/user-role';
import { AuthRoles } from '../../../../identidade/interfaces/http/auth/decorators/auth-roles.decorator';
import { AddPartToOrderRequestDto } from './dtos/add-part-to-order-request.dto';
import { AddServiceToOrderRequestDto } from './dtos/add-service-to-order-request.dto';
import { AverageExecutionTimeResponseDto } from './dtos/average-execution-time-response.dto';
import { CreateServiceOrderRequestDto } from './dtos/create-service-order-request.dto';
import { RegisterDiagnosisRequestDto } from './dtos/register-diagnosis-request.dto';
import { OpenServiceOrderRequestDto } from './dtos/open-service-order-request.dto';
import { RejectBudgetRequestDto } from './dtos/reject-budget-request.dto';
import { ServiceOrderResponseDto } from './dtos/service-order-response.dto';

@ApiTags('Ordem de Serviço / Ordens (interno)')
@ApiBearerAuth()
@Controller('service-orders')
export class ServiceOrderController {
  constructor(
    private readonly createOrder: CreateServiceOrderUseCase,
    private readonly openOrder: OpenServiceOrderUseCase,
    private readonly getOrder: GetServiceOrderUseCase,
    private readonly getAllOrders: GetAllServiceOrdersUseCase,
    private readonly registerDiagnosis: RegisterDiagnosisUseCase,
    private readonly addService: AddServiceToOrderUseCase,
    private readonly addPart: AddPartToOrderUseCase,
    private readonly generateBudget: GenerateBudgetUseCase,
    private readonly approveBudget: ApproveBudgetUseCase,
    private readonly rejectBudget: RejectBudgetUseCase,
    private readonly finish: FinishServiceOrderUseCase,
    private readonly deliver: DeliverServiceOrderUseCase,
    private readonly avgExecution: GetAverageExecutionTimeUseCase,
  ) {}

  @Post()
  @AuthRoles(UserRole.ADMIN, UserRole.ATENDENTE)
  @ApiOperation({ summary: 'Criar ordem de servico' })
  @ApiResponse({ status: 201, type: ServiceOrderResponseDto })
  async create(
    @Body() dto: CreateServiceOrderRequestDto,
  ): Promise<ServiceOrderResponseDto> {
    const order = await this.createOrder.execute({
      clientId: dto.clientId,
      vehicleId: dto.vehicleId,
      requestedServicesDescription: dto.requestedServicesDescription,
    });
    return ServiceOrderResponseDto.toDto(order);
  }

  @Post('open')
  @AuthRoles(UserRole.ADMIN, UserRole.ATENDENTE)
  @ApiOperation({
    summary: 'Abrir ordem de servico em uma unica chamada',
    description:
      'Recebe cliente, veiculo, servicos e pecas no mesmo body e retorna a OS criada com seu id. Cliente e veiculo sao reaproveitados quando o documento/placa ja existirem; caso contrario, sao criados. Nao substitui o POST /service-orders (criacao por ids).',
  })
  @ApiResponse({ status: 201, type: ServiceOrderResponseDto })
  async open(
    @Body() dto: OpenServiceOrderRequestDto,
  ): Promise<ServiceOrderResponseDto> {
    const order = await this.openOrder.execute({
      client: dto.client,
      vehicle: dto.vehicle,
      requestedServicesDescription: dto.requestedServicesDescription,
      services: dto.services,
      parts: dto.parts,
    });
    return ServiceOrderResponseDto.toDto(order);
  }

  @Get('metrics/average-execution-time')
  @AuthRoles(UserRole.ADMIN, UserRole.ATENDENTE, UserRole.MECANICO)
  @ApiOperation({ summary: 'Tempo medio de execucao das OSs concluidas' })
  @ApiResponse({ status: 200, type: AverageExecutionTimeResponseDto })
  async averageTime(): Promise<AverageExecutionTimeResponseDto> {
    const r = await this.avgExecution.execute();
    return AverageExecutionTimeResponseDto.toDto(r);
  }

  @Get()
  @AuthRoles(UserRole.ADMIN, UserRole.ATENDENTE, UserRole.MECANICO)
  @ApiOperation({ summary: 'Listar ordens de servico' })
  @ApiResponse({ status: 200, type: [ServiceOrderResponseDto] })
  async findAll(): Promise<ServiceOrderResponseDto[]> {
    const list = await this.getAllOrders.execute();
    return list.map((o) => ServiceOrderResponseDto.toDto(o));
  }

  @Get(':id')
  @AuthRoles(UserRole.ADMIN, UserRole.ATENDENTE, UserRole.MECANICO)
  @ApiOperation({ summary: 'Detalhar ordem de servico' })
  @ApiResponse({ status: 200, type: ServiceOrderResponseDto })
  async findOne(@Param('id') id: string): Promise<ServiceOrderResponseDto> {
    const order = await this.getOrder.execute(id);
    return ServiceOrderResponseDto.toDto(order);
  }

  @Patch(':id/diagnosis')
  @AuthRoles(UserRole.ADMIN, UserRole.MECANICO)
  @ApiOperation({
    summary: 'Registrar diagnóstico',
    description:
      'Após o diagnóstico, a OS fica em IN_DIAGNOSIS. Em seguida inclua serviços/peças (POST .../services e/ou .../parts) e gere o orçamento com POST .../budget para enviar o valor ao cliente (consulta pública GET /public/service-orders/:id/budget).',
  })
  @ApiResponse({ status: 200, type: ServiceOrderResponseDto })
  async diagnosis(
    @Param('id') id: string,
    @Body() dto: RegisterDiagnosisRequestDto,
  ): Promise<ServiceOrderResponseDto> {
    const order = await this.registerDiagnosis.execute(id, dto.diagnosis);
    return ServiceOrderResponseDto.toDto(order);
  }

  @Post(':id/services')
  @AuthRoles(UserRole.ADMIN, UserRole.MECANICO, UserRole.ATENDENTE)
  @ApiOperation({
    summary: 'Adicionar serviço do catálogo na OS',
    description:
      'Etapa após o diagnóstico; compõe o escopo que será precificado no orçamento.',
  })
  @ApiResponse({ status: 200, type: ServiceOrderResponseDto })
  async addServiceToOrder(
    @Param('id') id: string,
    @Body() dto: AddServiceToOrderRequestDto,
  ): Promise<ServiceOrderResponseDto> {
    const order = await this.addService.execute(
      id,
      dto.catalogServiceId,
      dto.quantity ?? 1,
    );
    return ServiceOrderResponseDto.toDto(order);
  }

  @Post(':id/parts')
  @AuthRoles(UserRole.ADMIN, UserRole.MECANICO, UserRole.ATENDENTE)
  @ApiOperation({
    summary: 'Adicionar peça avulsa na OS',
    description:
      'Opcional; aumenta a demanda de produtos no orçamento (FIFO na geração).',
  })
  @ApiResponse({ status: 200, type: ServiceOrderResponseDto })
  async addPartToOrder(
    @Param('id') id: string,
    @Body() dto: AddPartToOrderRequestDto,
  ): Promise<ServiceOrderResponseDto> {
    const order = await this.addPart.execute(id, dto.productCode, dto.quantity);
    return ServiceOrderResponseDto.toDto(order);
  }

  @Post(':id/budget')
  @AuthRoles(UserRole.ADMIN, UserRole.ATENDENTE, UserRole.MECANICO)
  @ApiOperation({
    summary: 'Gerar orçamento',
    description:
      'Calcula totais e FIFO das peças; status passa a WAITING_APPROVAL (aguardando aprovação). Na primeira vez nesse status, com diagnóstico já registrado, o orçamento é “enviado” ao cliente (porta de notificação). Regenerações do orçamento em WAITING_APPROVAL não disparam novo envio. O cliente pode consultar em GET /public/service-orders/:id/budget?document=...',
  })
  @ApiResponse({ status: 200, type: ServiceOrderResponseDto })
  async budget(@Param('id') id: string): Promise<ServiceOrderResponseDto> {
    const order = await this.generateBudget.execute(id);
    return ServiceOrderResponseDto.toDto(order);
  }

  @Post(':id/approve-budget')
  @AuthRoles(UserRole.ADMIN, UserRole.ATENDENTE)
  @ApiOperation({
    summary:
      'Aprovar orçamento (valida estoque, baixa FIFO, status IN_EXECUTION; idempotente se já em execução)',
  })
  @ApiResponse({ status: 200, type: ServiceOrderResponseDto })
  @ApiResponse({ status: 409, description: 'Estoque insuficiente' })
  async approve(@Param('id') id: string): Promise<ServiceOrderResponseDto> {
    const order = await this.approveBudget.execute(id);
    return ServiceOrderResponseDto.toDto(order);
  }

  @Post(':id/reject-budget')
  @AuthRoles(UserRole.ADMIN, UserRole.ATENDENTE)
  @ApiOperation({
    summary:
      'Reprovar orçamento (regras na entidade; encerra OS em CANCELLED, sem baixa de estoque)',
  })
  @ApiResponse({ status: 200, type: ServiceOrderResponseDto })
  async reject(
    @Param('id') id: string,
    @Body(new DefaultValuePipe({})) dto: RejectBudgetRequestDto,
  ): Promise<ServiceOrderResponseDto> {
    const order = await this.rejectBudget.execute(id, dto.reason);
    return ServiceOrderResponseDto.toDto(order);
  }

  @Post(':id/finish')
  @AuthRoles(UserRole.ADMIN, UserRole.MECANICO)
  @ApiOperation({ summary: 'Finalizar execucao' })
  @ApiResponse({ status: 200, type: ServiceOrderResponseDto })
  async finishExecution(
    @Param('id') id: string,
  ): Promise<ServiceOrderResponseDto> {
    const order = await this.finish.execute(id);
    return ServiceOrderResponseDto.toDto(order);
  }

  @Post(':id/deliver')
  @AuthRoles(UserRole.ADMIN, UserRole.ATENDENTE)
  @ApiOperation({ summary: 'Entregar veiculo' })
  @ApiResponse({ status: 200, type: ServiceOrderResponseDto })
  async deliverOrder(
    @Param('id') id: string,
  ): Promise<ServiceOrderResponseDto> {
    const order = await this.deliver.execute(id);
    return ServiceOrderResponseDto.toDto(order);
  }
}
