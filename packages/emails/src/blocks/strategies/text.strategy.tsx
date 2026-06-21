import { Section, Text } from '@react-email/components';
import { BlockType } from '@email/core';
import { sectionStyle } from '../../theme/theme-style';
import type { BlockRenderStrategy } from '../block-render-strategy';

/** Renders a paragraph of text. */
export const textStrategy: BlockRenderStrategy<typeof BlockType.Text> = {
  type: BlockType.Text,
  render(block, theme) {
    const { text, align, fontSize } = block.props;
    return (
      <Section style={sectionStyle(theme, { textAlign: align })}>
        <Text style={{ color: theme.colors.text, fontSize, margin: 0 }}>{text}</Text>
      </Section>
    );
  },
};
