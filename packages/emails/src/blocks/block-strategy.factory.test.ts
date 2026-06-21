import { describe, expect, it } from 'vitest';
import { isValidElement } from 'react';
import { BLOCK_TYPE_VALUES, BlockFactory, BlockType, DEFAULT_THEME } from '@email/core';
import { BlockStrategyFactory } from './block-strategy.factory';

describe('BlockStrategyFactory', () => {
  it.each([...BLOCK_TYPE_VALUES])('registers a strategy for the %s block', (type) => {
    expect(BlockStrategyFactory.getStrategy(type).type).toBe(type);
  });

  it('renders a block into a react element', () => {
    const block = BlockFactory.create(BlockType.Button);
    const element = BlockStrategyFactory.renderBlock(block, DEFAULT_THEME);
    expect(isValidElement(element)).toBe(true);
  });
});
