import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongodbModule } from '../../../shared/infrastructure/database/mongodb/mongodb.module';
import {
  ClientModel,
  ClientSchema,
} from './mongodb/models/client/client.model';
import { UserModel, UserSchema } from './mongodb/models/user/user.model';
import {
  VehicleModel,
  VehicleSchema,
} from './mongodb/models/vehicle/vehicle.model';
import { MongodbClientRepository } from './mongodb/repositories/mongodb-client-repository';
import { MongodbUserRepository } from './mongodb/repositories/mongodb-user-repository';
import { MongodbVehicleRepository } from './mongodb/repositories/mongodb-vehicle-repository';
import {
  CLIENT_REPOSITORY,
  USER_REPOSITORY,
  VEHICLE_REPOSITORY,
} from '../../domain/repositories/tokens';

@Module({
  imports: [
    MongodbModule,
    MongooseModule.forFeature([
      {
        name: ClientModel.name,
        schema: ClientSchema,
      },
      {
        name: VehicleModel.name,
        schema: VehicleSchema,
      },
      {
        name: UserModel.name,
        schema: UserSchema,
      },
    ]),
  ],
  providers: [
    {
      provide: CLIENT_REPOSITORY,
      useClass: MongodbClientRepository,
    },
    {
      provide: VEHICLE_REPOSITORY,
      useClass: MongodbVehicleRepository,
    },
    {
      provide: USER_REPOSITORY,
      useClass: MongodbUserRepository,
    },
  ],
  exports: [CLIENT_REPOSITORY, VEHICLE_REPOSITORY, USER_REPOSITORY],
})
export class IdentidadeDatabaseModule {}
