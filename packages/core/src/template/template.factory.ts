import { BlockFactory } from '../blocks/block.factory';
import { BlockType } from '../blocks/block.schema';
import { DEFAULT_THEME } from '../theme/theme.schema';
import type { TemplateDocument } from './template.schema';

/**
 * Builds a sensible starter template (header, intro text, CTA button and
 * footer) using the {@link DEFAULT_THEME}. Used when a user creates a new
 * template so the canvas is never empty.
 *
 * @param name - The name for the new template. Defaults to `Untitled template`.
 * @returns A schema-valid {@link TemplateDocument}.
 */
export function createDefaultTemplate(name = 'Untitled template'): TemplateDocument {
  return {
    name,
    theme: DEFAULT_THEME,
    blocks: BlockFactory.createMany([
      BlockType.Header,
      BlockType.Text,
      BlockType.Button,
      BlockType.Footer,
    ]),
  };
}
