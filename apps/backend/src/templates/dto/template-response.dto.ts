import { blockSchema, templateVariableSchema, themeSchema } from '@email/core';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/**
 * Schema describing a template as returned by the API, including its id and
 * ISO-8601 timestamps.
 */
export const templateResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  theme: themeSchema,
  blocks: z.array(blockSchema),
  variables: z.array(templateVariableSchema).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/**
 * A template as returned by the API.
 */
export type TemplateResponse = z.infer<typeof templateResponseSchema>;

/**
 * Response DTO for a template (drives the OpenAPI schema).
 */
export class TemplateResponseDto extends createZodDto(templateResponseSchema) {}
