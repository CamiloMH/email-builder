import { Button, Section } from '@react-email/components';
import { BlockType } from '@email/core';
import { buttonStyle, sectionStyle } from '../../theme/theme-style';
import type { BlockRenderStrategy } from '../block-render-strategy';

/** Renders a call-to-action button. */
export const buttonStrategy: BlockRenderStrategy<typeof BlockType.Button> = {
  type: BlockType.Button,
  render(block, theme) {
    const { label, href, align, variant, fullWidth } = block.props;
    return (
      <Section style={sectionStyle(theme, { textAlign: align })}>
        <Button href={href} style={buttonStyle(theme, variant, fullWidth)}>
          {label}
        </Button>
      </Section>
    );
  },
};
