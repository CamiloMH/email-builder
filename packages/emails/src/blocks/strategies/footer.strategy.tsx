import { Hr, Link, Section, Text } from '@react-email/components';
import { Align, BlockType } from '@email/core';
import { sectionStyle } from '../../theme/theme-style';
import type { BlockRenderStrategy } from '../block-render-strategy';

/** Renders the footer: company info and an optional unsubscribe link. */
export const footerStrategy: BlockRenderStrategy<typeof BlockType.Footer> = {
  type: BlockType.Footer,
  render(block, theme) {
    const { companyName, address, unsubscribeUrl, text } = block.props;
    return (
      <Section style={sectionStyle(theme, { textAlign: Align.Center })}>
        <Hr style={{ borderColor: theme.colors.muted, marginBottom: 12 }} />
        <Text style={{ color: theme.colors.text, fontWeight: 600, margin: 0 }}>{companyName}</Text>
        {address ? <Text style={{ color: theme.colors.muted, margin: 0 }}>{address}</Text> : null}
        {text ? <Text style={{ color: theme.colors.muted, marginTop: 8 }}>{text}</Text> : null}
        {unsubscribeUrl ? (
          <Text style={{ margin: 0, marginTop: 8 }}>
            <Link href={unsubscribeUrl} style={{ color: theme.colors.primary }}>
              Unsubscribe
            </Link>
          </Text>
        ) : null}
      </Section>
    );
  },
};
