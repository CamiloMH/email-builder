import { describe, expect, it } from 'vitest';
import { BlockFactory } from './block.factory';
import { BLOCK_CATALOG } from './block.catalog';
import { BLOCK_TYPE_VALUES, BlockType, blockSchema } from './block.schema';

describe('BlockFactory', () => {
  it('exposes every block type as available', () => {
    expect(BlockFactory.availableTypes).toEqual(BLOCK_TYPE_VALUES);
  });

  it('exposes a catalog entry for every block type', () => {
    expect(BlockFactory.catalog).toHaveLength(BLOCK_TYPE_VALUES.length);
    for (const definition of BlockFactory.catalog) {
      expect(definition.label).toBeTruthy();
      expect(definition.icon).toBeTruthy();
    }
  });

  it.each([...BLOCK_TYPE_VALUES])('creates a schema-valid %s block', (type) => {
    const block = BlockFactory.create(type);
    expect(block.type).toBe(type);
    expect(block.id).toBeTruthy();
    // The factory defaults must always satisfy the domain schema.
    expect(() => blockSchema.parse(block)).not.toThrow();
  });

  it('assigns a unique id to each created block', () => {
    const a = BlockFactory.create(BlockType.Text);
    const b = BlockFactory.create(BlockType.Text);
    expect(a.id).not.toBe(b.id);
  });

  it('gives nested columns and social links their own ids', () => {
    const columns = BlockFactory.create(BlockType.Columns);
    const ids = columns.props.columns.map((column) => column.id);
    expect(new Set(ids).size).toBe(ids.length);

    const social = BlockFactory.create(BlockType.Social);
    const linkIds = social.props.links.map((link) => link.id);
    expect(new Set(linkIds).size).toBe(linkIds.length);
  });

  it('creates many blocks preserving order', () => {
    const order = [BlockType.Footer, BlockType.Header, BlockType.Text];
    const blocks = BlockFactory.createMany(order);
    expect(blocks.map((block) => block.type)).toEqual(order);
  });

  it('keeps the catalog keyed consistently with the type field', () => {
    for (const type of BLOCK_TYPE_VALUES) {
      expect(BLOCK_CATALOG[type].type).toBe(type);
    }
  });
});
