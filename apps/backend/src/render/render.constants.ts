import { ExportFormat } from '@email/core';

/** Time window (ms) for the render endpoint's dedicated rate limit. */
export const RENDER_THROTTLE_TTL = 60_000;

/** Max render requests allowed per {@link RENDER_THROTTLE_TTL} window. */
export const RENDER_THROTTLE_LIMIT = 20;

/** MIME content type for each export format. */
export const EXPORT_CONTENT_TYPE: Record<ExportFormat, string> = {
  [ExportFormat.Html]: 'text/html',
  [ExportFormat.Text]: 'text/plain',
  [ExportFormat.React]: 'text/plain; charset=utf-8',
  [ExportFormat.Hbs]: 'text/plain; charset=utf-8',
  [ExportFormat.Eml]: 'message/rfc822',
  [ExportFormat.Json]: 'application/json',
};

// File extensions live in `@email/core` (EXPORT_EXTENSION) so the frontend and
// backend agree on the produced filename.
export { EXPORT_EXTENSION } from '@email/core';
