import { BlockType, type Block, type Theme } from '@email/core';
import type { ReactElement } from 'react';
import type { BlockRenderStrategy } from './block-render-strategy';
import { buttonStrategy } from './strategies/button.strategy';
import { cardStrategy } from './strategies/card.strategy';
import { columnsStrategy } from './strategies/columns.strategy';
import { dividerStrategy } from './strategies/divider.strategy';
import { footerStrategy } from './strategies/footer.strategy';
import { headerStrategy } from './strategies/header.strategy';
import { imageStrategy } from './strategies/image.strategy';
import { socialStrategy } from './strategies/social.strategy';
import { spacerStrategy } from './strategies/spacer.strategy';
import { textStrategy } from './strategies/text.strategy';

/**
 * Registry of every render strategy, keyed by {@link BlockType}. The `satisfies`
 * clause guarantees a strategy exists for each kind and that it matches the
 * block's props.
 */
const strategies = {
  [BlockType.Header]: headerStrategy,
  [BlockType.Text]: textStrategy,
  [BlockType.Image]: imageStrategy,
  [BlockType.Button]: buttonStrategy,
  [BlockType.Card]: cardStrategy,
  [BlockType.Divider]: dividerStrategy,
  [BlockType.Spacer]: spacerStrategy,
  [BlockType.Columns]: columnsStrategy,
  [BlockType.Social]: socialStrategy,
  [BlockType.Footer]: footerStrategy,
} satisfies { [T in BlockType]: BlockRenderStrategy<T> };

/**
 * Factory (creational design pattern) that resolves the render strategy for a
 * given block kind and renders blocks polymorphically.
 */
export const BlockStrategyFactory = {
  /**
   * Returns the render strategy registered for a block kind.
   *
   * @param type - The block kind.
   * @returns The matching render strategy.
   */
  getStrategy(type: BlockType): BlockRenderStrategy {
    // Each registry entry is keyed by `type`, so the widening is safe.
    return strategies[type] as unknown as BlockRenderStrategy;
  },

  /**
   * Renders a block using its registered strategy.
   *
   * @param block - The block to render.
   * @param theme - The active email theme.
   * @returns The rendered react-email element.
   */
  renderBlock(block: Block, theme: Theme): ReactElement {
    return this.getStrategy(block.type).render(block, theme);
  },
};
