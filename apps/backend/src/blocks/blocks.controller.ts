import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BlocksService, type BlockDefinitionResponse } from './blocks.service';

/**
 * REST controller exposing the block catalog used by the builder palette.
 */
@ApiTags('blocks')
@Controller('blocks')
export class BlocksController {
  /**
   * @param blocksService - The blocks catalog service.
   */
  constructor(private readonly blocksService: BlocksService) {}

  /**
   * Returns the catalog of available block kinds.
   *
   * @returns The block catalog.
   */
  @Get()
  findAll(): BlockDefinitionResponse[] {
    return this.blocksService.list();
  }
}
