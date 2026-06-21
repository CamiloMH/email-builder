import { Module } from '@nestjs/common';
import { BlocksController } from './blocks.controller';
import { BlocksService } from './blocks.service';

/**
 * Module exposing the block catalog endpoint.
 */
@Module({
  controllers: [BlocksController],
  providers: [BlocksService],
})
export class BlocksModule {}
