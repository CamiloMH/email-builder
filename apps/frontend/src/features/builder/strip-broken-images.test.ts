import { Align, BlockType, DEFAULT_THEME, type TemplateDocument } from '@email/core';
import { describe, expect, it } from 'vitest';
import { stripBrokenImages } from './strip-broken-images';

const doc: TemplateDocument = {
  name: 'x',
  theme: DEFAULT_THEME,
  blocks: [
    {
      id: 'i1',
      type: BlockType.Image,
      props: { src: 'https://broken/a.png', alt: 'a', widthPercent: 100 },
    },
    {
      id: 'h1',
      type: BlockType.Header,
      props: { title: 't', align: Align.Left, logoUrl: 'https://broken/logo.png' },
    },
    {
      id: 'c1',
      type: BlockType.Card,
      props: {
        title: 'c',
        text: 't',
        backgroundColor: '#FFFFFF',
        align: Align.Left,
        imageUrl: 'https://broken/card.png',
      },
    },
    { id: 't1', type: BlockType.Text, props: { text: 'ok', align: Align.Left, fontSize: 16 } },
  ],
};

describe('stripBrokenImages', () => {
  it('returns the original document when nothing is broken', () => {
    expect(stripBrokenImages(doc, new Set())).toBe(doc);
  });

  it('drops broken image blocks and clears broken header/card images', () => {
    const broken = new Set([
      'https://broken/a.png',
      'https://broken/logo.png',
      'https://broken/card.png',
    ]);
    const result = stripBrokenImages(doc, broken);

    expect(result.blocks).toHaveLength(3);
    expect(result.blocks.some((b) => b.type === BlockType.Image)).toBe(false);
    const header = result.blocks.find((b) => b.type === BlockType.Header);
    expect(header?.type === BlockType.Header && header.props.logoUrl).toBeUndefined();
    const card = result.blocks.find((b) => b.type === BlockType.Card);
    expect(card?.type === BlockType.Card && card.props.imageUrl).toBeUndefined();
  });
});
