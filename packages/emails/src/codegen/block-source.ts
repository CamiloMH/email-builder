import { Align, BlockType, type Block, type BlockOfType, type Theme } from '@email/core';
import { SOCIAL_LABELS, socialIconUrl } from '../blocks/social-icons';
import { buttonStyle, imageAlignStyle, sectionStyle } from '../theme/theme-style';
import { el, txt, raw, type JsxChild, type JsxElement } from './jsx-source';

/**
 * Generates the JSX source tree for a single block kind. One generator exists
 * per {@link BlockType}, mirroring the render strategies but emitting source
 * code instead of React elements. Style helpers are shared with the renderer so
 * the generated component looks identical to the live preview.
 *
 * @typeParam T - The block kind this generator handles.
 */
export type BlockSourceGenerator<T extends BlockType> = (
  block: BlockOfType<T>,
  theme: Theme,
) => JsxElement;

/** Registry of source generators, keyed by {@link BlockType}. */
const generators = {
  [BlockType.Header]: (block, theme) => {
    const { logoUrl, title, subtitle, align, logoAlign, logoInline, backgroundColor } = block.props;
    const inline = Boolean(logoInline && logoUrl);
    const children: JsxChild[] = [];
    if (logoUrl && !inline) {
      children.push(
        el('Img', {
          attrs: { src: logoUrl, alt: title, height: 40 },
          style: { marginBottom: 12, ...imageAlignStyle(logoAlign ?? align) },
        }),
      );
    }
    const headingChildren: JsxChild[] = [];
    if (inline && logoUrl) {
      headingChildren.push(
        el('Img', {
          attrs: { src: logoUrl, alt: title, height: 28 },
          style: { display: 'inline-block', verticalAlign: 'middle', marginRight: 8 },
        }),
      );
    }
    headingChildren.push(txt(title));
    children.push(
      el('Heading', { style: { color: theme.colors.text, margin: 0 }, children: headingChildren }),
    );
    if (subtitle) {
      children.push(
        el('Text', {
          style: { color: theme.colors.muted, marginTop: 8, marginBottom: 0 },
          children: [txt(subtitle)],
        }),
      );
    }
    return el('Section', { style: sectionStyle(theme, { textAlign: align, backgroundColor }), children });
  },

  [BlockType.Text]: (block, theme) => {
    const { text, align, fontSize } = block.props;
    return el('Section', {
      style: sectionStyle(theme, { textAlign: align }),
      children: [
        el('Text', { style: { color: theme.colors.text, fontSize, margin: 0 }, children: [txt(text)] }),
      ],
    });
  },

  [BlockType.Image]: (block, theme) => {
    const { src, alt, href, widthPercent } = block.props;
    const image = el('Img', {
      attrs: { src, alt },
      style: { width: `${widthPercent}%`, height: 'auto', display: 'block', margin: '0 auto' },
    });
    return el('Section', {
      style: sectionStyle(theme),
      children: [href ? el('Link', { attrs: { href }, children: [image] }) : image],
    });
  },

  [BlockType.Button]: (block, theme) => {
    const { label, href, align, variant, fullWidth } = block.props;
    return el('Section', {
      style: sectionStyle(theme, { textAlign: align }),
      children: [
        el('Button', {
          attrs: { href },
          style: buttonStyle(theme, variant, fullWidth),
          children: [txt(label)],
        }),
      ],
    });
  },

  [BlockType.Card]: (block, theme) => {
    const { title, text, imageUrl, buttonLabel, buttonHref, backgroundColor, align } = block.props;
    const inner: JsxChild[] = [];
    if (imageUrl) {
      inner.push(
        el('Img', {
          attrs: { src: imageUrl, alt: title },
          style: {
            width: '100%',
            height: 'auto',
            borderRadius: theme.layout.borderRadius,
            marginBottom: 12,
          },
        }),
      );
    }
    inner.push(
      el('Heading', {
        style: { color: theme.colors.text, margin: 0, fontSize: 20 },
        children: [txt(title)],
      }),
    );
    inner.push(
      el('Text', { style: { color: theme.colors.muted, marginTop: 8 }, children: [txt(text)] }),
    );
    if (buttonLabel && buttonHref) {
      inner.push(
        el('Button', {
          attrs: { href: buttonHref },
          style: buttonStyle(theme),
          children: [txt(buttonLabel)],
        }),
      );
    }
    return el('Section', {
      style: sectionStyle(theme),
      children: [
        el('Section', {
          style: {
            backgroundColor,
            border: `1px solid ${theme.colors.muted}`,
            borderRadius: theme.layout.borderRadius,
            padding: 20,
            textAlign: align,
          },
          children: inner,
        }),
      ],
    });
  },

  [BlockType.Divider]: (_block, theme) =>
    el('Section', {
      style: { paddingLeft: theme.layout.spacing, paddingRight: theme.layout.spacing },
      children: [el('Hr', { style: { borderColor: theme.colors.muted, margin: 0 } })],
    }),

  [BlockType.Spacer]: (block) =>
    el('Section', {
      style: { height: block.props.height, lineHeight: '1px', fontSize: '1px' },
      children: [raw('&nbsp;')],
    }),

  [BlockType.Columns]: (block, theme) =>
    el('Section', {
      style: sectionStyle(theme),
      children: [
        el('Row', {
          children: block.props.columns.map((column) => {
            const cell: JsxChild[] = [];
            if (column.heading) {
              cell.push(
                el('Text', {
                  style: { color: theme.colors.text, fontWeight: 600, margin: 0 },
                  children: [txt(column.heading)],
                }),
              );
            }
            cell.push(
              el('Text', {
                style: { color: theme.colors.muted, marginTop: 4 },
                children: [txt(column.text)],
              }),
            );
            return el('Column', {
              style: { verticalAlign: 'top', paddingLeft: 8, paddingRight: 8 },
              children: cell,
            });
          }),
        }),
      ],
    }),

  [BlockType.Social]: (block, theme) =>
    el('Section', {
      style: sectionStyle(theme, { textAlign: Align.Center }),
      children: block.props.links.map((link) =>
        el('Link', {
          attrs: { href: link.url },
          style: { display: 'inline-block', marginLeft: 8, marginRight: 8 },
          children: [
            el('Img', {
              attrs: {
                src: socialIconUrl(link.platform),
                alt: SOCIAL_LABELS[link.platform],
                width: 24,
                height: 24,
              },
              style: { display: 'inline-block' },
            }),
          ],
        }),
      ),
    }),

  [BlockType.Footer]: (block, theme) => {
    const { companyName, address, unsubscribeUrl, text } = block.props;
    const children: JsxChild[] = [
      el('Hr', { style: { borderColor: theme.colors.muted, marginBottom: 12 } }),
      el('Text', {
        style: { color: theme.colors.text, fontWeight: 600, margin: 0 },
        children: [txt(companyName)],
      }),
    ];
    if (address) {
      children.push(
        el('Text', { style: { color: theme.colors.muted, margin: 0 }, children: [txt(address)] }),
      );
    }
    if (text) {
      children.push(
        el('Text', { style: { color: theme.colors.muted, marginTop: 8 }, children: [txt(text)] }),
      );
    }
    if (unsubscribeUrl) {
      children.push(
        el('Text', {
          style: { margin: 0, marginTop: 8 },
          children: [
            el('Link', {
              attrs: { href: unsubscribeUrl },
              style: { color: theme.colors.primary },
              children: [txt('Unsubscribe')],
            }),
          ],
        }),
      );
    }
    return el('Section', {
      style: sectionStyle(theme, { textAlign: Align.Center }),
      children,
    });
  },
} satisfies { [T in BlockType]: BlockSourceGenerator<T> };

/**
 * Generates the JSX source tree for a block, dispatching on its kind (Factory
 * pattern, mirroring `BlockStrategyFactory`).
 *
 * @param block - The block to generate source for.
 * @param theme - The active email theme.
 * @returns The block's JSX element tree.
 */
export function blockToJsx(block: Block, theme: Theme): JsxElement {
  const generator = generators[block.type] as BlockSourceGenerator<BlockType>;
  return generator(block, theme);
}
