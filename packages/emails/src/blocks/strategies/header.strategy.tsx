import { Heading, Img, Section, Text } from '@react-email/components';
import { BlockType } from '@email/core';
import { imageAlignStyle, sectionStyle } from '../../theme/theme-style';
import type { BlockRenderStrategy } from '../block-render-strategy';

/** Renders a header block: optional logo, a title and an optional subtitle. */
export const headerStrategy: BlockRenderStrategy<typeof BlockType.Header> = {
  type: BlockType.Header,
  render(block, theme) {
    const { logoUrl, title, subtitle, align, logoAlign, logoInline, backgroundColor } = block.props;
    const inline = Boolean(logoInline && logoUrl);
    return (
      <Section style={sectionStyle(theme, { textAlign: align, backgroundColor })}>
        {logoUrl && !inline ? (
          <Img
            src={logoUrl}
            alt={title}
            height={40}
            style={{ marginBottom: 12, ...imageAlignStyle(logoAlign ?? align) }}
          />
        ) : null}
        <Heading style={{ color: theme.colors.text, margin: 0 }}>
          {inline && logoUrl ? (
            <Img
              src={logoUrl}
              alt={title}
              height={28}
              style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 8 }}
            />
          ) : null}
          {title}
        </Heading>
        {subtitle ? (
          <Text style={{ color: theme.colors.muted, marginTop: 8, marginBottom: 0 }}>
            {subtitle}
          </Text>
        ) : null}
      </Section>
    );
  },
};
