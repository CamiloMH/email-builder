import { Img, Link, Section } from '@react-email/components';
import { BlockType } from '@email/core';
import { sectionStyle } from '../../theme/theme-style';
import type { BlockRenderStrategy } from '../block-render-strategy';

/** Renders an image, wrapping it in a link when `href` is set. */
export const imageStrategy: BlockRenderStrategy<typeof BlockType.Image> = {
  type: BlockType.Image,
  render(block, theme) {
    const { src, alt, href, widthPercent } = block.props;
    const image = (
      <Img
        src={src}
        alt={alt}
        style={{ width: `${widthPercent}%`, height: 'auto', display: 'block', margin: '0 auto' }}
      />
    );
    return (
      <Section style={sectionStyle(theme)}>
        {href ? <Link href={href}>{image}</Link> : image}
      </Section>
    );
  },
};
