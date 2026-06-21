import { BLOCK_TYPE_VALUES, BlockFactory, BlockType } from '@email/core';
import { describe, expect, it } from 'vitest';
import { blockLabel, blockSummary } from './block-summary';

describe('blockLabel', () => {
  it('returns the catalog label for a block', () => {
    expect(blockLabel(BlockFactory.create(BlockType.Header))).toBe('Header');
  });
});

describe('blockSummary', () => {
  it('returns a non-empty summary for every block kind', () => {
    for (const type of BLOCK_TYPE_VALUES) {
      expect(blockSummary(BlockFactory.create(type)).length).toBeGreaterThan(0);
    }
  });

  it('uses content-aware summaries', () => {
    expect(blockSummary(BlockFactory.create(BlockType.Header))).toContain('Welcome');
    expect(blockSummary(BlockFactory.create(BlockType.Spacer))).toContain('px');
    expect(blockSummary(BlockFactory.create(BlockType.Columns))).toContain('columnas');
    expect(blockSummary(BlockFactory.create(BlockType.Social))).toContain('enlaces');
    expect(blockSummary(BlockFactory.create(BlockType.Divider))).toContain('Separador');
  });
});
