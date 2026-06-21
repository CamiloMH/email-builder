import { ExportFormat, type TemplateDocument } from '@email/core';
import type { RenderedEmail } from '@email/emails';
import { Inject, Injectable } from '@nestjs/common';
import { TemplatesService } from '../templates/templates.service';
import { EMAIL_RENDERER, type EmailRenderer } from './email-renderer.port';
import { EXPORT_CONTENT_TYPE, EXPORT_EXTENSION } from './render.constants';

/**
 * A rendered template ready to be downloaded as a file.
 */
export interface ExportedTemplate {
  /** The file content. */
  content: string;
  /** The MIME content type. */
  contentType: string;
  /** The suggested download filename. */
  filename: string;
}

/**
 * Converts a template name into a filename-safe slug.
 *
 * @param name - The template name.
 * @returns A filename-safe slug, or `email` when empty.
 */
function slugify(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug.length > 0 ? slug : 'email';
}

/**
 * Wraps the rendered email in an RFC822 `.eml` multipart/alternative message so
 * it can be opened directly in a mail client.
 *
 * @param subject - The email subject.
 * @param html - The HTML body.
 * @param text - The plain-text body.
 * @returns The `.eml` file content.
 */
function buildEml(subject: string, html: string, text: string): string {
  const boundary = 'email-builder-boundary';
  return [
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=utf-8',
    '',
    text,
    `--${boundary}`,
    'Content-Type: text/html; charset=utf-8',
    '',
    html,
    `--${boundary}--`,
    '',
  ].join('\r\n');
}

/**
 * Renders templates to HTML/plain text and produces downloadable exports.
 */
@Injectable()
export class RenderService {
  /**
   * @param renderer - The email renderer port.
   * @param templatesService - The templates service (to load stored templates).
   */
  constructor(
    @Inject(EMAIL_RENDERER) private readonly renderer: EmailRenderer,
    private readonly templatesService: TemplatesService,
  ) {}

  /**
   * Renders an ad-hoc document (not persisted).
   *
   * @param document - The template document to render.
   * @returns The rendered email.
   */
  renderDocument(document: TemplateDocument): Promise<RenderedEmail> {
    return this.renderer.render(document);
  }

  /**
   * Renders a stored, owned template and packages it for download.
   *
   * @param id - The template id.
   * @param ownerKey - The owner key.
   * @param format - The desired export format.
   * @returns The exportable file.
   */
  async exportTemplate(
    id: string,
    ownerKey: string,
    format: ExportFormat,
  ): Promise<ExportedTemplate> {
    const document = await this.templatesService.findDocument(id, ownerKey);
    const content = await this.renderContent(document, format);
    return {
      content,
      contentType: EXPORT_CONTENT_TYPE[format],
      filename: `${slugify(document.name)}.${EXPORT_EXTENSION[format]}`,
    };
  }

  /**
   * Produces the file body for a given export format. The React format emits a
   * react-email component source file and skips HTML rendering entirely.
   *
   * @param document - The template document.
   * @param format - The export format.
   * @returns The file content.
   */
  private async renderContent(document: TemplateDocument, format: ExportFormat): Promise<string> {
    if (format === ExportFormat.React) {
      return this.renderer.renderToReactSource(document);
    }
    if (format === ExportFormat.Json) {
      return JSON.stringify(document, null, 2);
    }
    const rendered = await this.renderer.render(document);
    switch (format) {
      case ExportFormat.Text:
        return rendered.text;
      case ExportFormat.Eml:
        return buildEml(document.name, rendered.html, rendered.text);
      // HTML and HBS share the same markup; HBS keeps the `{{merge tags}}`,
      // which the export already preserves, making it a valid Handlebars template.
      default:
        return rendered.html;
    }
  }
}
