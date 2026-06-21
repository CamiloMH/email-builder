import { Img, Link, Section } from '@react-email/components';
import { Align, BlockType } from '@email/core';
import { sectionStyle } from '../../theme/theme-style';
import { SOCIAL_LABELS, socialIconUrl } from '../social-icons';
import type { BlockRenderStrategy } from '../block-render-strategy';

/** Renders a row of social network logos linking to each profile. */
export const socialStrategy: BlockRenderStrategy<typeof BlockType.Social> = {
  type: BlockType.Social,
  render(block, theme) {
    const { links } = block.props;
    return (
      <Section style={sectionStyle(theme, { textAlign: Align.Center })}>
        {links.map((link) => (
          <Link
            key={link.id}
            href={link.url}
            style={{ display: 'inline-block', marginLeft: 8, marginRight: 8 }}
          >
            <Img
              src={socialIconUrl(link.platform)}
              alt={SOCIAL_LABELS[link.platform]}
              width={24}
              height={24}
              style={{ display: 'inline-block' }}
            />
          </Link>
        ))}
      </Section>
    );
  },
};
