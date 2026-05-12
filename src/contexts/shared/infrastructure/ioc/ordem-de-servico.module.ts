import { Module } from '@nestjs/common';
import { CatalogServiceModule } from '../../../ordem-de-servico/infrastructure/ioc/catalog-service.module';
import { ServiceOrderModule } from '../../../ordem-de-servico/infrastructure/ioc/service-order.module';

@Module({
  imports: [CatalogServiceModule, ServiceOrderModule],
})
export class OrdemDeServicoModule {}
