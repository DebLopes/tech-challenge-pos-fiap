import { Module } from '@nestjs/common';
import { ClientModule } from '../../../identidade/infrastructure/ioc/client.module';
import { VehicleModule } from '../../../identidade/infrastructure/ioc/vehicle.module';
import { EstoqueModule } from '../../../shared/infrastructure/ioc/estoque.module';
import { CLIENT_LOOKUP } from '../../domain/services/client-lookup.port';
import { CLIENT_PROVISIONING } from '../../domain/services/client-provisioning.port';
import { VEHICLE_LOOKUP } from '../../domain/services/vehicle-lookup.port';
import { VEHICLE_PROVISIONING } from '../../domain/services/vehicle-provisioning.port';
import { PRODUCT_LOOKUP } from '../../domain/services/product-lookup.port';
import { PRODUCT_PROVISIONING } from '../../domain/services/product-provisioning.port';
import { IdentidadeClientAdapter } from './identidade-client.adapter';
import { IdentidadeVehicleAdapter } from './identidade-vehicle.adapter';
import { EstoqueProductAdapter } from './estoque-product.adapter';

@Module({
  imports: [ClientModule, VehicleModule, EstoqueModule],
  providers: [
    IdentidadeClientAdapter,
    IdentidadeVehicleAdapter,
    EstoqueProductAdapter,
    { provide: CLIENT_LOOKUP, useExisting: IdentidadeClientAdapter },
    { provide: CLIENT_PROVISIONING, useExisting: IdentidadeClientAdapter },
    { provide: VEHICLE_LOOKUP, useExisting: IdentidadeVehicleAdapter },
    { provide: VEHICLE_PROVISIONING, useExisting: IdentidadeVehicleAdapter },
    { provide: PRODUCT_LOOKUP, useExisting: EstoqueProductAdapter },
    { provide: PRODUCT_PROVISIONING, useExisting: EstoqueProductAdapter },
  ],
  exports: [
    CLIENT_LOOKUP,
    CLIENT_PROVISIONING,
    VEHICLE_LOOKUP,
    VEHICLE_PROVISIONING,
    PRODUCT_LOOKUP,
    PRODUCT_PROVISIONING,
    EstoqueModule,
  ],
})
export class OrdemDeServicoAdaptersModule {}
