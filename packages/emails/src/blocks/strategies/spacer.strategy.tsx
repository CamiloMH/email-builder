import { Section } from '@react-email/components';
import { BlockType } from '@email/core';
import type { BlockRenderStrategy } from '../block-render-strategy';

/** Renders vertical whitespace of a configurable height. */
export const spacerStrategy: BlockRenderStrategy<typeof BlockType.Spacer> = {
  type: BlockType.Spacer,
  render(block) {
    return (
      <Section style={{ height: block.props.height, lineHeight: '1px', fontSize: '1px' }}>
        &nbsp;
      </Section>
    );
  },
};
