import { Button, Heading, Img, Section, Text } from '@react-email/components';
import { BlockType } from '@email/core';
import { buttonStyle, sectionStyle } from '../../theme/theme-style';
import type { BlockRenderStrategy } from '../block-render-strategy';

/** Renders a content card: a bordered, padded box with optional image and CTA. */
export const cardStrategy: BlockRenderStrategy<typeof BlockType.Card> = {
  type: BlockType.Card,
  render(block, theme) {
    const { title, text, imageUrl, buttonLabel, buttonHref, backgroundColor, align } = block.props;
    return (
      <Section style={sectionStyle(theme)}>
        <Section
          style={{
            backgroundColor,
            border: `1px solid ${theme.colors.muted}`,
            borderRadius: theme.layout.borderRadius,
            padding: 20,
            textAlign: align,
          }}
        >
          {imageUrl ? (
            <Img
              src={imageUrl}
              alt={title}
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: theme.layout.borderRadius,
                marginBottom: 12,
              }}
            />
          ) : null}
          <Heading style={{ color: theme.colors.text, margin: 0, fontSize: 20 }}>{title}</Heading>
          <Text style={{ color: theme.colors.muted, marginTop: 8 }}>{text}</Text>
          {buttonLabel && buttonHref ? (
            <Button href={buttonHref} style={buttonStyle(theme)}>
              {buttonLabel}
            </Button>
          ) : null}
        </Section>
      </Section>
    );
  },
};
