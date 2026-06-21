import { transform } from 'esbuild';
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
import { renderTemplateToReactSource, toComponentName } from './react-source.builder';

/** A template exercising every block kind and both branches of optional fields. */
const fullDocument: TemplateDocument = {
  name: 'Mi Plantilla 2024',
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
    { id: 't1', type: BlockType.Text, props: { text: 'Body copy', align: Align.Left, fontSize: 16 } },
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
        label: 'Click me',
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
        text: 'Card body',
        imageUrl: 'https://placehold.co/600x200/png',
        buttonLabel: 'Card CTA',
        buttonHref: 'https://example.com/card',
        backgroundColor: '#FFFFFF',
        align: Align.Left,
      },
    },
    { id: 'cd2', type: BlockType.Card, props: { title: 'Bare card', text: 'No image, no CTA', backgroundColor: '#EEEEEE', align: Align.Center } },
    { id: 'd1', type: BlockType.Divider, props: {} },
    { id: 'sp1', type: BlockType.Spacer, props: { height: 32 } },
    {
      id: 'c1',
      type: BlockType.Columns,
      props: {
        columns: [
          { id: 'col1', heading: 'Column heading', text: 'First column' },
          { id: 'col2', text: 'Second column' },
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
        companyName: 'Acme Inc',
        address: '1 Market Street',
        unsubscribeUrl: 'https://example.com/unsubscribe',
        text: 'Footer note',
      },
    },
    { id: 'f2', type: BlockType.Footer, props: { companyName: 'Minimal Co' } },
  ],
};

describe('toComponentName', () => {
  it('builds a PascalCase identifier from the template name', () => {
    expect(toComponentName('Untitled template')).toBe('UntitledTemplate');
    expect(toComponentName('  black-friday sale!  ')).toBe('BlackFridaySale');
  });

  it('falls back and guards leading digits', () => {
    expect(toComponentName('   ')).toBe('EmailTemplate');
    expect(toComponentName('2024 recap')).toBe('Email2024Recap');
  });
});

describe('renderTemplateToReactSource', () => {
  it('emits an import line, the component wrapper and a default export', () => {
    const source = renderTemplateToReactSource(createDefaultTemplate());
    expect(source).toContain("from '@react-email/components';");
    expect(source).toContain('export const UntitledTemplate = () => (');
    expect(source).toContain('export default UntitledTemplate;');
    expect(source).toContain('<Html>');
    // Default theme embeds Inter, so the head carries a <style> @import...
    expect(source).toContain("@import url('https://fonts.googleapis.com/css2?family=Inter");
    // ...but the native <style> tag must NOT be imported from react-email.
    expect(source.split('\n')[0]).not.toContain('style');
  });

  it('emits a dark-mode media query and container class when a dark palette is set', () => {
    const source = renderTemplateToReactSource({
      ...createDefaultTemplate(),
      theme: {
        ...createDefaultTemplate().theme,
        darkMode: { background: '#111111', surface: '#1F1F1F', text: '#EEEEEE' },
      },
    });
    expect(source).toContain('@media (prefers-color-scheme: dark)');
    expect(source).toContain('className="email-container"');
  });

  it('imports exactly the components it uses, sorted', () => {
    const source = renderTemplateToReactSource(fullDocument);
    const importLine = source.split('\n')[0];
    expect(importLine).toBe(
      'import { Body, Button, Column, Container, Head, Heading, Hr, Html, Img, Link, Row, Section, Text } from ' +
        "'@react-email/components';",
    );
  });

  it('renders the content of every block kind and both optional branches', () => {
    const source = renderTemplateToReactSource(fullDocument);
    for (const fragment of [
      'Logo Header',
      'With subtitle',
      'Plain Header',
      'Body copy',
      'https://example.com/landing',
      'Click me',
      'Card heading',
      'Card CTA',
      'Bare card',
      'Column heading',
      'Second column',
      'https://cdn.simpleicons.org/x',
      'https://cdn.simpleicons.org/github',
      'Acme Inc',
      'Footer note',
      'Minimal Co',
      'Unsubscribe',
      '&nbsp;',
    ]) {
      expect(source).toContain(fragment);
    }
  });

  it('never leaks undefined values or stringified objects', () => {
    const source = renderTemplateToReactSource(fullDocument);
    expect(source).not.toContain('undefined');
    expect(source).not.toContain('[object Object]');
    expect(source).not.toContain('NaN');
  });

  it('handles a template with no blocks', () => {
    const source = renderTemplateToReactSource({ name: 'Empty', theme: DEFAULT_THEME, blocks: [] });
    expect(source).toContain('export const Empty = () => (');
    expect(source).toMatch(/<Container style=\{\{.*\}\} \/>/);
  });

  it('produces syntactically valid TSX', async () => {
    const source = renderTemplateToReactSource(fullDocument);
    await expect(transform(source, { loader: 'tsx' })).resolves.toBeDefined();
  });
});
