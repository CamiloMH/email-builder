import { EXPORT_EXTENSION, ExportFormat, type TemplateDocument } from '@email/core';
import { renderTemplate, renderTemplateToReactSource } from '@email/emails';

/** An exported template file ready to be saved. */
export interface ExportedFile {
  /** The file contents. */
  blob: Blob;
  /** The suggested filename. */
  filename: string;
}

/** MIME type per export format, used as the download blob type. */
const CONTENT_TYPE: Record<ExportFormat, string> = {
  [ExportFormat.Html]: 'text/html; charset=utf-8',
  [ExportFormat.Text]: 'text/plain; charset=utf-8',
  [ExportFormat.React]: 'text/plain; charset=utf-8',
  [ExportFormat.Hbs]: 'text/plain; charset=utf-8',
  [ExportFormat.Eml]: 'message/rfc822',
  [ExportFormat.Json]: 'application/json',
};

// Converts a template name into a filename-safe slug.
function slugify(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug.length > 0 ? slug : 'email';
}

// Wraps the rendered email in an RFC822 multipart/alternative .eml message.
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

// Produces the file body for a given format, mirroring the backend exporter so
// HTML, text, React source, Handlebars, EML and JSON stay byte-compatible.
async function contentFor(document: TemplateDocument, format: ExportFormat): Promise<string> {
  if (format === ExportFormat.React) {
    return renderTemplateToReactSource(document);
  }
  if (format === ExportFormat.Json) {
    return JSON.stringify(document, null, 2);
  }
  const rendered = await renderTemplate(document);
  switch (format) {
    case ExportFormat.Text:
      return rendered.text;
    case ExportFormat.Eml:
      return buildEml(document.name, rendered.html, rendered.text);
    // HTML and HBS share the same markup; HBS keeps the `{{merge tags}}`.
    default:
      return rendered.html;
  }
}

/**
 * Exports a template document to a downloadable file entirely in the browser,
 * using the shared `@email/emails` engine. This removes the need for a backend
 * export endpoint so the app can be deployed as a static site.
 *
 * @param document - The template document to export.
 * @param format - The desired export format.
 * @returns The exported file blob and a suggested filename.
 */
export async function exportTemplate(
  document: TemplateDocument,
  format: ExportFormat,
): Promise<ExportedFile> {
  const content = await contentFor(document, format);
  return {
    blob: new Blob([content], { type: CONTENT_TYPE[format] }),
    filename: `${slugify(document.name)}.${EXPORT_EXTENSION[format]}`,
  };
}
