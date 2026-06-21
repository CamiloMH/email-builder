import { BlocksController } from './blocks.controller';
import type { BlocksService, BlockDefinitionResponse } from './blocks.service';

describe('BlocksController', () => {
  it('returns the catalog from the service', () => {
    const catalog: BlockDefinitionResponse[] = [];
    const service = { list: jest.fn().mockReturnValue(catalog) };
    const controller = new BlocksController(service as unknown as BlocksService);
    expect(controller.findAll()).toBe(catalog);
    expect(service.list).toHaveBeenCalledTimes(1);
  });
});
