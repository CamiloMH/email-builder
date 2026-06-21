import { render } from '@react-email/render';
import type { TemplateDocument } from '@email/core';
import { EmailDocumentBuilder } from '../builder/email-document.builder';

/**
 * The result of rendering a template: the HTML email and its plain-text version.
 */
export interface RenderedEmail {
  /** The rendered HTML email. */
  html: string;
  /** The plain-text fallback. */
  text: string;
}

/**
 * Renders a {@link TemplateDocument} into HTML and plain text using react-email.
 * This is the shared entry point used by the frontend (live preview) and the
 * backend (export), keeping the output identical.
 *
 * @param document - The template document to render.
 * @returns The rendered HTML and plain-text email.
 */
export async function renderTemplate(document: TemplateDocument): Promise<RenderedEmail> {
  const tree = EmailDocumentBuilder.fromDocument(document).build();
  const [html, text] = await Promise.all([render(tree), render(tree, { plainText: true })]);
  return { html, text };
}
