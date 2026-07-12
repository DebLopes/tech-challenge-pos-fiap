import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from '../../interfaces/http/health/health.controller';
import { MongodbModule } from '../database/mongodb/mongodb.module';

@Module({
  imports: [TerminusModule, MongodbModule],
  controllers: [HealthController],
})
export class HealthModule {}
