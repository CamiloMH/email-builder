import { BlockType, type Block, type TemplateDocument } from '@email/core';

/**
 * Returns a copy of the document with broken images removed for the live
 * preview: image blocks with a broken `src` are dropped, and optional
 * header/card images with a broken URL are cleared. The stored document is not
 * modified, so fixing the URL restores the image.
 *
 * @param document - The template document.
 * @param broken - The set of URLs known to have failed to load.
 * @returns A document safe to preview (or the original when nothing is broken).
 */
export function stripBrokenImages(
  document: TemplateDocument,
  broken: ReadonlySet<string>,
): TemplateDocument {
  if (broken.size === 0) {
    return document;
  }
  const blocks = document.blocks.flatMap((block): Block[] => {
    if (block.type === BlockType.Image && broken.has(block.props.src)) {
      return [];
    }
    if (block.type === BlockType.Header && block.props.logoUrl && broken.has(block.props.logoUrl)) {
      return [{ ...block, props: { ...block.props, logoUrl: undefined } }];
    }
    if (block.type === BlockType.Card && block.props.imageUrl && broken.has(block.props.imageUrl)) {
      return [{ ...block, props: { ...block.props, imageUrl: undefined } }];
    }
    return [block];
  });
  return { ...document, blocks };
}
