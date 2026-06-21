import { Hr, Section } from '@react-email/components';
import { BlockType } from '@email/core';
import type { BlockRenderStrategy } from '../block-render-strategy';

/** Renders a horizontal divider rule. */
export const dividerStrategy: BlockRenderStrategy<typeof BlockType.Divider> = {
  type: BlockType.Divider,
  render(_block, theme) {
    return (
      <Section style={{ paddingLeft: theme.layout.spacing, paddingRight: theme.layout.spacing }}>
        <Hr style={{ borderColor: theme.colors.muted, margin: 0 }} />
      </Section>
    );
  },
};
