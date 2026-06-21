/**
 * Enum-like `const` of the formats a rendered email can be exported as.
 * - `React` — standalone react-email component (`.tsx`) source.
 * - `Hbs` — HTML with `{{merge tags}}` preserved, i.e. a Handlebars template.
 * - `Eml` — an RFC822 `.eml` message openable in mail clients.
 * - `Json` — the raw template document (for backup / re-import).
 */
export const ExportFormat = {
  Html: 'html',
  Text: 'text',
  React: 'react',
  Hbs: 'hbs',
  Eml: 'eml',
  Json: 'json',
} as const;

/**
 * A supported export format.
 */
export type ExportFormat = (typeof ExportFormat)[keyof typeof ExportFormat];

/**
 * All export formats, for validation and iteration.
 */
export const EXPORT_FORMAT_VALUES: readonly ExportFormat[] = Object.values(ExportFormat);

/**
 * File extension produced by each export format. Single source of truth shared
 * by the backend (download filename) and the frontend (fallback filename).
 */
export const EXPORT_EXTENSION: Record<ExportFormat, string> = {
  [ExportFormat.Html]: 'html',
  [ExportFormat.Text]: 'txt',
  [ExportFormat.React]: 'tsx',
  [ExportFormat.Hbs]: 'hbs',
  [ExportFormat.Eml]: 'eml',
  [ExportFormat.Json]: 'json',
};
