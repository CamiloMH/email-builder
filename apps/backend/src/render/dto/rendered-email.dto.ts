import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/**
 * Schema for a rendered email: the HTML and its plain-text version.
 */
export const renderedEmailSchema = z.object({
  html: z.string(),
  text: z.string(),
});

/**
 * Response DTO for a rendered email (drives the OpenAPI schema).
 */
export class RenderedEmailResponseDto extends createZodDto(renderedEmailSchema) {}
