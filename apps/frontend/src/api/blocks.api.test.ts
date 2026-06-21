import { BlockFactory, BlockType } from '@email/core';
import { describe, expect, it } from 'vitest';
import { blocksApi } from './blocks.api';

describe('blocksApi', () => {
  it('lists the core catalog with one entry per block kind', async () => {
    const blocks = await blocksApi.list();
    expect(blocks).toHaveLength(BlockFactory.catalog.length);
    expect(blocks.map((block) => block.type)).toContain(BlockType.Header);
  });

  it('exposes default props for each entry', async () => {
    const blocks = await blocksApi.list();
    for (const block of blocks) {
      expect(block).toHaveProperty('icon');
      expect(block.defaultProps).toBeTypeOf('object');
    }
  });
});
