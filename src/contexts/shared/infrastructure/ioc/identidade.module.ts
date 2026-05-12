import { Module } from '@nestjs/common';
import { AuthModule } from '../../../identidade/infrastructure/ioc/auth.module';
import { ClientModule } from '../../../identidade/infrastructure/ioc/client.module';
import { VehicleModule } from '../../../identidade/infrastructure/ioc/vehicle.module';

@Module({
  imports: [AuthModule, ClientModule, VehicleModule],
})
export class IdentidadeModule {}
