import { describe, expect, it } from 'vitest';
import {
  Align,
  BlockType,
  ButtonVariant,
  DEFAULT_THEME,
  SocialPlatform,
  createDefaultTemplate,
  type TemplateDocument,
} from '@email/core';
import { renderTemplate } from './render-template';

/**
 * A template exercising every block kind and both branches of each optional
 * field, so the strategies are fully covered.
 */
const fullDocument: TemplateDocument = {
  name: 'Full coverage',
  theme: DEFAULT_THEME,
  blocks: [
    {
      id: 'h1',
      type: BlockType.Header,
      props: {
        logoUrl: 'https://placehold.co/120x40/png',
        title: 'Logo Header',
        subtitle: 'With subtitle',
        align: Align.Center,
        logoAlign: Align.Left,
        backgroundColor: '#ABCDEF',
      },
    },
    { id: 'h2', type: BlockType.Header, props: { title: 'Plain Header', align: Align.Left } },
    {
      id: 'h3',
      type: BlockType.Header,
      props: {
        logoUrl: 'https://placehold.co/80x24/png',
        title: 'Inline Header',
        align: Align.Left,
        logoInline: true,
      },
    },
    {
      id: 't1',
      type: BlockType.Text,
      props: { text: 'Body copy here', align: Align.Left, fontSize: 16 },
    },
    {
      id: 'i1',
      type: BlockType.Image,
      props: {
        src: 'https://placehold.co/600x200/png',
        alt: 'Linked image',
        href: 'https://example.com/landing',
        widthPercent: 100,
      },
    },
    {
      id: 'i2',
      type: BlockType.Image,
      props: { src: 'https://placehold.co/600x200/png', alt: 'Plain image', widthPercent: 80 },
    },
    {
      id: 'b1',
      type: BlockType.Button,
      props: {
        label: 'Click me now',
        href: 'https://example.com/cta',
        align: Align.Center,
        variant: ButtonVariant.Outline,
        fullWidth: true,
      },
    },
    {
      id: 'cd1',
      type: BlockType.Card,
      props: {
        title: 'Card heading',
        text: 'Card body copy',
        imageUrl: 'https://placehold.co/600x200/png',
        buttonLabel: 'Card CTA',
        buttonHref: 'https://example.com/card',
        backgroundColor: '#FFFFFF',
        align: Align.Left,
      },
    },
    { id: 'd1', type: BlockType.Divider, props: {} },
    { id: 'sp1', type: BlockType.Spacer, props: { height: 32 } },
    {
      id: 'c1',
      type: BlockType.Columns,
      props: {
        columns: [
          { id: 'col1', heading: 'Column heading', text: 'First column body' },
          { id: 'col2', text: 'Second column body' },
        ],
      },
    },
    {
      id: 'so1',
      type: BlockType.Social,
      props: {
        links: [
          { id: 'l1', platform: SocialPlatform.Twitter, url: 'https://twitter.com/acme' },
          { id: 'l2', platform: SocialPlatform.GitHub, url: 'https://github.com/acme' },
        ],
      },
    },
    {
      id: 'f1',
      type: BlockType.Footer,
      props: {
        companyName: 'Acme Incorporated',
        address: '1 Market Street',
        unsubscribeUrl: 'https://example.com/unsubscribe',
        text: 'Footer note',
      },
    },
    { id: 'f2', type: BlockType.Footer, props: { companyName: 'Minimal Company' } },
  ],
};

describe('renderTemplate', () => {
  it('renders the default template to non-empty HTML and text', async () => {
    const { html, text } = await renderTemplate(createDefaultTemplate());
    expect(html.toLowerCase()).toContain('<html');
    expect(html).toContain('Welcome to our newsletter');
    expect(html).toContain('Get started');
    // Headings are upper-cased by the plain-text converter, so assert on body copy.
    expect(text).toContain('Write your message here');
    expect(text.length).toBeGreaterThan(0);
  });

  it('renders every block kind with both optional branches', async () => {
    const { html, text } = await renderTemplate(fullDocument);

    // Header (with and without logo / subtitle), plus its background color
    expect(html).toContain('Logo Header');
    expect(html).toContain('120x40');
    expect(html).toContain('With subtitle');
    expect(html).toContain('Plain Header');
    expect(html).toContain('Inline Header');
    expect(html).toContain('80x24');
    expect(html.toLowerCase()).toContain('#abcdef');

    // Text, button, card, columns, social, footers
    expect(html).toContain('Body copy here');
    expect(html).toContain('Click me now');
    expect(html).toContain('Card heading');
    expect(html).toContain('Card body copy');
    expect(html).toContain('Card CTA');
    expect(html).toContain('Column heading');
    expect(html).toContain('First column body');
    expect(html).toContain('Second column body');
    expect(html).toContain('Twitter');
    expect(html).toContain('GitHub');
    expect(html).toContain('Acme Incorporated');
    expect(html).toContain('Footer note');
    expect(html).toContain('Minimal Company');
    expect(html).toContain('Unsubscribe');

    // Links from image (href) and button
    expect(html).toContain('https://example.com/landing');
    expect(html).toContain('https://example.com/cta');

    // Theme primary color is applied (button background / link color)
    expect(html.toLowerCase()).toContain(DEFAULT_THEME.colors.primary.toLowerCase());

    // Plain text export carries the textual content
    expect(text).toContain('Body copy here');
  });

  it('renders a template with no blocks', async () => {
    const { html } = await renderTemplate({
      name: 'Empty',
      theme: DEFAULT_THEME,
      blocks: [],
    });
    expect(html.toLowerCase()).toContain('<html');
  });

  it('embeds the web font and a dark-mode media query in the head', async () => {
    const { html } = await renderTemplate({
      name: 'Themed',
      theme: { ...DEFAULT_THEME, darkMode: { background: '#101010', text: '#FAFAFA' } },
      blocks: [],
    });
    expect(html).toContain("@import url('https://fonts.googleapis.com/css2?family=Inter");
    expect(html).toContain('@media (prefers-color-scheme: dark)');
  });
});
