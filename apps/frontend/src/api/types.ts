import type { Block, BlockType, TemplateDocument, Theme } from '@email/core';

/**
 * A template as returned by the backend API.
 */
export interface TemplateResponse {
  /** Unique identifier. */
  id: string;
  /** Template name. */
  name: string;
  /** Optional description. */
  description?: string;
  /** Visual theme. */
  theme: Theme;
  /** Ordered blocks. */
  blocks: Block[];
  /** ISO-8601 creation timestamp. */
  createdAt: string;
  /** ISO-8601 last-update timestamp. */
  updatedAt: string;
}

/**
 * A rendered email (HTML + plain text), as returned by the render endpoint.
 */
export interface RenderedEmail {
  /** Rendered HTML. */
  html: string;
  /** Plain-text fallback. */
  text: string;
}

/**
 * A block catalog entry from the `/blocks` endpoint, used by the palette.
 */
export interface BlockDefinitionDto {
  /** Block kind. */
  type: BlockType;
  /** Display label. */
  label: string;
  /** Short description. */
  description: string;
  /** Lucide icon name. */
  icon: string;
  /** Default props used when the block is added. */
  defaultProps: Block['props'];
}

/**
 * Extracts the renderable {@link TemplateDocument} from an API template.
 *
 * @param template - The API template.
 * @returns The renderable document.
 */
export function toDocument(template: TemplateResponse): TemplateDocument {
  return {
    name: template.name,
    description: template.description,
    theme: template.theme,
    blocks: template.blocks,
  };
}
