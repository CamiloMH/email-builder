import { BlockFactory, BlockType, DEFAULT_THEME, createDefaultTemplate } from '@email/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { useBuilderStore } from './builder-store';

const store = () => useBuilderStore.getState();

beforeEach(() => {
  store().reset();
});

describe('builder store', () => {
  it('loads a document and selects the first block', () => {
    const document = createDefaultTemplate();
    store().setDocument(document);
    expect(store().document?.name).toBe(document.name);
    expect(store().selectedBlockId).toBe(document.blocks[0]?.id);
  });

  it('no-ops every mutation when no document is loaded', () => {
    store().setName('x');
    store().setDescription('x');
    store().addBlock(BlockFactory.create(BlockType.Text));
    store().removeBlock('a');
    store().reorderBlocks('a', 'b');
    store().updateBlockProps('a', { text: 'y' });
    store().updateTheme(DEFAULT_THEME);
    expect(store().document).toBeNull();
  });

  it('updates the name, description and theme', () => {
    store().setDocument(createDefaultTemplate());
    store().setName('Renamed');
    store().setDescription('A description');
    const theme = { ...DEFAULT_THEME, colors: { ...DEFAULT_THEME.colors, primary: '#FF0000' } };
    store().updateTheme(theme);
    expect(store().document?.name).toBe('Renamed');
    expect(store().document?.description).toBe('A description');
    expect(store().document?.theme.colors.primary).toBe('#FF0000');
  });

  it('adds a block at the end and selects it', () => {
    store().setDocument(createDefaultTemplate());
    const before = store().document?.blocks.length ?? 0;
    const block = BlockFactory.create(BlockType.Image);
    store().addBlock(block);
    expect(store().document?.blocks).toHaveLength(before + 1);
    expect(store().document?.blocks.at(-1)?.id).toBe(block.id);
    expect(store().selectedBlockId).toBe(block.id);
  });

  it('adds a block at a specific index', () => {
    store().setDocument(createDefaultTemplate());
    const block = BlockFactory.create(BlockType.Divider);
    store().addBlock(block, 0);
    expect(store().document?.blocks[0]?.id).toBe(block.id);
  });

  it('removes a block and clears the selection when it was selected', () => {
    store().setDocument(createDefaultTemplate());
    const id = store().document?.blocks[0]?.id as string;
    store().selectBlock(id);
    store().removeBlock(id);
    expect(store().document?.blocks.some((block) => block.id === id)).toBe(false);
    expect(store().selectedBlockId).toBeNull();
  });

  it('reorders blocks and ignores unknown ids', () => {
    store().setDocument(createDefaultTemplate());
    const blocks = store().document?.blocks ?? [];
    const [first, second] = [blocks[0]?.id as string, blocks[1]?.id as string];
    store().reorderBlocks(first, second);
    expect(store().document?.blocks[1]?.id).toBe(first);

    const snapshot = store().document?.blocks.map((block) => block.id);
    store().reorderBlocks('nope', second);
    expect(store().document?.blocks.map((block) => block.id)).toEqual(snapshot);
  });

  it('merges a props patch into the target block', () => {
    store().setDocument(createDefaultTemplate());
    const header = store().document?.blocks[0];
    store().updateBlockProps(header?.id as string, { title: 'Patched title' });
    const updated = store().document?.blocks[0];
    expect((updated?.props as { title: string }).title).toBe('Patched title');
  });

  it('selects and clears a block', () => {
    store().setDocument(createDefaultTemplate());
    store().selectBlock('abc');
    expect(store().selectedBlockId).toBe('abc');
    store().selectBlock(null);
    expect(store().selectedBlockId).toBeNull();
  });

  it('sets and clears the highlight color', () => {
    store().setHighlightColor('#2563EB');
    expect(store().highlightColor).toBe('#2563EB');
    store().setHighlightColor(null);
    expect(store().highlightColor).toBeNull();
  });

  it('clears the highlight color on reset', () => {
    store().setHighlightColor('#FFFFFF');
    store().reset();
    expect(store().highlightColor).toBeNull();
  });

  it('undoes and redoes a structural change', () => {
    store().setDocument(createDefaultTemplate());
    const before = store().document?.blocks.length ?? 0;
    store().addBlock(BlockFactory.create(BlockType.Image));
    expect(store().document?.blocks.length).toBe(before + 1);

    store().undo();
    expect(store().document?.blocks.length).toBe(before);

    store().redo();
    expect(store().document?.blocks.length).toBe(before + 1);
  });

  it('coalesces consecutive same-kind edits into one undo step', () => {
    store().setDocument(createDefaultTemplate());
    store().setName('A');
    store().setName('AB');
    store().setName('ABC');
    store().undo();
    // One undo reverts the whole typing burst back to the loaded name.
    expect(store().document?.name).toBe(createDefaultTemplate().name);
  });

  it('no-ops undo/redo at the ends of history and after loading a document', () => {
    store().setDocument(createDefaultTemplate());
    expect(store().past).toHaveLength(0);
    store().undo();
    expect(store().document?.name).toBe(createDefaultTemplate().name);
    store().redo();
    expect(store().future).toHaveLength(0);
  });
});
