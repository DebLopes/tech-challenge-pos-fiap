import { Module } from '@nestjs/common';
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
  GetPublicServiceOrderBudgetUseCase,
  GetPublicServiceOrderStatusUseCase,
  GetServiceOrderUseCase,
  PublicApproveBudgetUseCase,
  PublicRejectBudgetUseCase,
  RegisterDiagnosisUseCase,
  RejectBudgetUseCase,
} from '../../application/use-case/service-order';
import { BUDGET_DELIVERY_NOTIFIER } from '../../domain/services/budget-delivery-notifier.port';
import { PublicServiceOrderController } from '../../interfaces/http/service-order/public-service-order.controller';
import { ServiceOrderController } from '../../interfaces/http/service-order/service-order.controller';
import { LoggingBudgetDeliveryNotifier } from '../notifications/logging-budget-delivery-notifier';
import { OrdemDeServicoDatabaseModule } from '../database/database.module';
import { EstoqueModule } from '../../../shared/infrastructure/ioc/estoque.module';
import { IdentidadeDatabaseModule } from '../../../identidade/infrastructure/database/database.module';
import { CatalogServiceDatabaseModule } from '../database/catalog-service-database.module';

@Module({
  imports: [
    OrdemDeServicoDatabaseModule,
    EstoqueModule,
    IdentidadeDatabaseModule,
    CatalogServiceDatabaseModule,
  ],
  providers: [
    {
      provide: BUDGET_DELIVERY_NOTIFIER,
      useClass: LoggingBudgetDeliveryNotifier,
    },
    CreateServiceOrderUseCase,
    GetServiceOrderUseCase,
    GetAllServiceOrdersUseCase,
    RegisterDiagnosisUseCase,
    AddServiceToOrderUseCase,
    AddPartToOrderUseCase,
    GenerateBudgetUseCase,
    ApproveBudgetUseCase,
    RejectBudgetUseCase,
    PublicApproveBudgetUseCase,
    PublicRejectBudgetUseCase,
    FinishServiceOrderUseCase,
    DeliverServiceOrderUseCase,
    GetPublicServiceOrderBudgetUseCase,
    GetPublicServiceOrderStatusUseCase,
    GetAverageExecutionTimeUseCase,
  ],
  controllers: [ServiceOrderController, PublicServiceOrderController],
})
export class ServiceOrderModule {}
