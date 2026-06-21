import { BLOCK_CATALOG, BlockType, type Block } from '@email/core';

/**
 * Returns the human-readable label for a block kind (from the shared catalog).
 *
 * @param block - The block.
 * @returns The block's display label.
 */
export function blockLabel(block: Block): string {
  return BLOCK_CATALOG[block.type].label;
}

/**
 * Returns a short, content-aware summary of a block for the canvas list.
 *
 * @param block - The block to summarize.
 * @returns A short summary string.
 */
export function blockSummary(block: Block): string {
  switch (block.type) {
    case BlockType.Header:
      return block.props.title;
    case BlockType.Text:
      return block.props.text.slice(0, 60);
    case BlockType.Image:
      return block.props.alt || block.props.src;
    case BlockType.Button:
      return block.props.label;
    case BlockType.Card:
      return block.props.title;
    case BlockType.Divider:
      return 'Separador horizontal';
    case BlockType.Spacer:
      return `Espacio de ${block.props.height}px`;
    case BlockType.Columns:
      return `${block.props.columns.length} columnas`;
    case BlockType.Social:
      return `${block.props.links.length} enlaces`;
    case BlockType.Footer:
      return block.props.companyName;
    default:
      return '';
  }
}
