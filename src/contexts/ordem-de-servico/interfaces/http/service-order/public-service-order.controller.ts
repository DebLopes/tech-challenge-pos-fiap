import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  GetPublicServiceOrderBudgetUseCase,
  GetPublicServiceOrderStatusUseCase,
  PublicApproveBudgetUseCase,
  PublicRejectBudgetUseCase,
} from '../../../application/use-case/service-order';
import { BudgetConverter } from './converters/service-order.converters';
import { BudgetResponseDto } from './dtos/budget-response.dto';
import { PublicBudgetDecisionResponseDto } from './dtos/public-budget-decision-response.dto';
import { PublicServiceOrderStatusResponseDto } from './dtos/public-service-order-status-response.dto';
import { RejectBudgetRequestDto } from './dtos/reject-budget-request.dto';

@ApiTags('Público / Ordens de Serviço')
@Controller('public/service-orders')
export class PublicServiceOrderController {
  constructor(
    private readonly getPublic: GetPublicServiceOrderStatusUseCase,
    private readonly getBudget: GetPublicServiceOrderBudgetUseCase,
    private readonly publicApprove: PublicApproveBudgetUseCase,
    private readonly publicReject: PublicRejectBudgetUseCase,
  ) {}

  @Get('status')
  @ApiOperation({
    summary: 'Consulta pública de status das OS por CPF/CNPJ',
    description:
      'Lista OS em aberto do cliente. Para ver itens e valores após o diagnóstico, use GET .../:serviceOrderId/budget com o mesmo documento.',
  })
  @ApiQuery({ name: 'document', required: true })
  @ApiQuery({ name: 'plate', required: false })
  @ApiResponse({ status: 200, type: PublicServiceOrderStatusResponseDto })
  async status(
    @Query('document') document: string,
    @Query('plate') plate?: string,
  ): Promise<PublicServiceOrderStatusResponseDto> {
    const rows = await this.getPublic.execute(document, plate);
    return PublicServiceOrderStatusResponseDto.toDto(rows);
  }

  @Get(':serviceOrderId/budget')
  @ApiOperation({
    summary: 'Consultar orçamento (simula envio ao cliente)',
    description:
      'Retorna o orçamento gerado pela oficina (itens e totais). Exige CPF/CNPJ igual ao da OS; `plate` opcional reforça a conferência. Sem JWT — mesmo modelo da consulta pública de status. Resposta 404 genérica se OS não existir, documento/placa não baterem ou o orçamento ainda não tiver sido gerado.',
  })
  @ApiParam({ name: 'serviceOrderId', description: 'ID da ordem de serviço' })
  @ApiQuery({ name: 'document', required: true })
  @ApiQuery({ name: 'plate', required: false })
  @ApiResponse({ status: 200, type: BudgetResponseDto })
  @ApiResponse({ status: 400, description: 'document obrigatório' })
  @ApiResponse({
    status: 404,
    description: 'Não encontrado (mensagem genérica por segurança)',
  })
  async budget(
    @Param('serviceOrderId') serviceOrderId: string,
    @Query('document') document: string,
    @Query('plate') plate?: string,
  ): Promise<BudgetResponseDto> {
    const budget = await this.getBudget.execute(
      serviceOrderId,
      document,
      plate,
    );
    return BudgetConverter.toDto(budget);
  }

  @Post(':serviceOrderId/approve-budget')
  @ApiOperation({
    summary: 'Cliente aprova orçamento (público)',
    description:
      'Exige CPF/CNPJ igual ao da OS; `plate` opcional reforça a conferência. Sem JWT. Aplica mesmas regras de estoque que a aprovação interna.',
  })
  @ApiParam({ name: 'serviceOrderId', description: 'ID da ordem de serviço' })
  @ApiQuery({ name: 'document', required: true })
  @ApiQuery({ name: 'plate', required: false })
  @ApiResponse({ status: 200, type: PublicBudgetDecisionResponseDto })
  @ApiResponse({
    status: 404,
    description: 'Não encontrado (mensagem genérica)',
  })
  async approveBudget(
    @Param('serviceOrderId') serviceOrderId: string,
    @Query('document') document: string,
    @Query('plate') plate?: string,
  ): Promise<PublicBudgetDecisionResponseDto> {
    const order = await this.publicApprove.execute(
      serviceOrderId,
      document,
      plate,
    );
    return PublicBudgetDecisionResponseDto.fromStatus(order.status);
  }

  @Post(':serviceOrderId/reject-budget')
  @ApiOperation({
    summary: 'Cliente reprova orçamento (público)',
    description:
      'Exige CPF/CNPJ (e placa opcional) como na consulta de orçamento. Sem JWT. Encerra a OS em CANCELLED.',
  })
  @ApiParam({ name: 'serviceOrderId', description: 'ID da ordem de serviço' })
  @ApiQuery({ name: 'document', required: true })
  @ApiQuery({ name: 'plate', required: false })
  @ApiResponse({ status: 200, type: PublicBudgetDecisionResponseDto })
  @ApiResponse({
    status: 404,
    description: 'Não encontrado (mensagem genérica)',
  })
  async rejectBudget(
    @Param('serviceOrderId') serviceOrderId: string,
    @Query('document') document: string,
    @Body(new DefaultValuePipe({})) dto: RejectBudgetRequestDto,
    @Query('plate') plate?: string,
  ): Promise<PublicBudgetDecisionResponseDto> {
    const order = await this.publicReject.execute(
      serviceOrderId,
      document,
      plate,
      dto.reason,
    );
    return PublicBudgetDecisionResponseDto.fromStatus(order.status);
  }
}
