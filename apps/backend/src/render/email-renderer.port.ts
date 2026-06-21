import type { TemplateDocument } from '@email/core';
import type { RenderedEmail } from '@email/emails';

/**
 * DI token for the {@link EmailRenderer} port.
 */
export const EMAIL_RENDERER = Symbol('EMAIL_RENDERER');

/**
 * Port (hexagonal architecture) abstracting how a template is rendered, so the
 * domain does not depend directly on react-email. Implemented by
 * {@link ReactEmailRendererAdapter}.
 */
export interface EmailRenderer {
  /**
   * Renders a template document into HTML and plain text.
   *
   * @param document - The template document to render.
   * @returns The rendered email.
   */
  render(document: TemplateDocument): Promise<RenderedEmail>;

  /**
   * Generates a standalone react-email component (`.tsx` source) from a
   * template document, for the "export as React component" format.
   *
   * @param document - The template document to export.
   * @returns The react-email component source code.
   */
  renderToReactSource(document: TemplateDocument): string;
}
