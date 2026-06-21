import { BLOCK_TYPE_VALUES } from '@email/core';
import { BlocksService } from './blocks.service';

describe('BlocksService', () => {
  const service = new BlocksService();

  it('returns a catalog entry for every block kind', () => {
    const catalog = service.list();
    expect(catalog).toHaveLength(BLOCK_TYPE_VALUES.length);
    expect(catalog.map((entry) => entry.type).sort()).toEqual([...BLOCK_TYPE_VALUES].sort());
  });

  it('includes metadata and default props for each entry', () => {
    for (const entry of service.list()) {
      expect(entry.label).toBeTruthy();
      expect(entry.icon).toBeTruthy();
      expect(entry.defaultProps).toBeDefined();
    }
  });
});
