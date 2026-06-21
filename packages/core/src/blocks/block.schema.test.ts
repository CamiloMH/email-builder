import { describe, expect, it } from 'vitest';
import { Align } from '../common/color.schema';
import {
  BLOCK_TYPE_VALUES,
  BlockType,
  ButtonVariant,
  blockSchema,
  blockTypeSchema,
  buttonBlockSchema,
  cardBlockSchema,
  columnsBlockSchema,
  headerBlockSchema,
  socialBlockSchema,
} from './block.schema';

describe('blockTypeSchema', () => {
  it('exposes every block kind', () => {
    expect(BLOCK_TYPE_VALUES).toHaveLength(10);
    expect(BLOCK_TYPE_VALUES).toContain(BlockType.Card);
  });

  it.each(BLOCK_TYPE_VALUES)('accepts the %s kind', (type) => {
    expect(blockTypeSchema.parse(type)).toBe(type);
  });

  it('rejects an unknown kind', () => {
    expect(blockTypeSchema.safeParse('carousel').success).toBe(false);
  });
});

describe('blockSchema (discriminated union)', () => {
  it('parses a valid header block', () => {
    const block = {
      id: 'b1',
      type: BlockType.Header,
      props: { title: 'Hi', align: Align.Center },
    };
    expect(blockSchema.parse(block)).toEqual(block);
  });

  it('rejects a block with an unknown type', () => {
    const result = blockSchema.safeParse({ id: 'b1', type: 'carousel', props: {} });
    expect(result.success).toBe(false);
  });

  it('rejects a header block missing its title', () => {
    const result = headerBlockSchema.safeParse({
      id: 'b1',
      type: BlockType.Header,
      props: { align: Align.Center },
    });
    expect(result.success).toBe(false);
  });

  it('rejects a block without an id', () => {
    const result = blockSchema.safeParse({
      type: BlockType.Divider,
      props: {},
    });
    expect(result.success).toBe(false);
  });
});

describe('columnsBlockSchema', () => {
  it('requires between two and three columns', () => {
    const oneColumn = {
      id: 'c1',
      type: BlockType.Columns,
      props: { columns: [{ id: 'col1', text: 'a' }] },
    };
    expect(columnsBlockSchema.safeParse(oneColumn).success).toBe(false);
  });
});

describe('socialBlockSchema', () => {
  it('rejects an unsupported platform', () => {
    const block = {
      id: 's1',
      type: BlockType.Social,
      props: { links: [{ id: 'l1', platform: 'myspace', url: 'https://myspace.com' }] },
    };
    expect(socialBlockSchema.safeParse(block).success).toBe(false);
  });

  it('rejects a non-url link', () => {
    const block = {
      id: 's1',
      type: BlockType.Social,
      props: { links: [{ id: 'l1', platform: 'twitter', url: 'not-a-url' }] },
    };
    expect(socialBlockSchema.safeParse(block).success).toBe(false);
  });
});

describe('buttonBlockSchema', () => {
  it('requires a valid variant and fullWidth flag', () => {
    const valid = {
      id: 'b1',
      type: BlockType.Button,
      props: {
        label: 'Go',
        href: 'https://example.com',
        align: Align.Center,
        variant: ButtonVariant.Outline,
        fullWidth: true,
      },
    };
    expect(buttonBlockSchema.parse(valid)).toEqual(valid);
    expect(
      buttonBlockSchema.safeParse({ ...valid, props: { ...valid.props, variant: 'ghost' } }).success,
    ).toBe(false);
  });
});

describe('cardBlockSchema', () => {
  it('parses a valid card and rejects a bad background color', () => {
    const card = {
      id: 'c1',
      type: BlockType.Card,
      props: {
        title: 'Hi',
        text: 'Body',
        backgroundColor: '#FFFFFF',
        align: Align.Left,
      },
    };
    expect(cardBlockSchema.parse(card)).toEqual(card);
    expect(
      cardBlockSchema.safeParse({ ...card, props: { ...card.props, backgroundColor: 'white' } })
        .success,
    ).toBe(false);
  });
});
