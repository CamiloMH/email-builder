import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';

/**
 * Module exposing the liveness endpoint.
 */
@Module({
  controllers: [HealthController],
})
export class HealthModule {}
