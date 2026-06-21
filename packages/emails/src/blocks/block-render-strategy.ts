import type { BlockOfType, BlockType, Theme } from '@email/core';
import type { ReactElement } from 'react';

/**
 * Strategy (behavioural design pattern) that knows how to render a single block
 * kind into a react-email element using the active theme. One implementation
 * exists per {@link BlockType}; the {@link BlockStrategyFactory} selects the
 * right one at runtime.
 *
 * @typeParam T - The block kind this strategy renders.
 */
export interface BlockRenderStrategy<T extends BlockType = BlockType> {
  /** The block kind handled by this strategy. */
  readonly type: T;
  /**
   * Renders the given block into a react-email element.
   *
   * @param block - The block to render.
   * @param theme - The active email theme.
   * @returns The rendered react-email element.
   */
  render(block: BlockOfType<T>, theme: Theme): ReactElement;
}
