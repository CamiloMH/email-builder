import { z } from 'zod';
import { blockSchema } from '../blocks/block.schema';
import { themeSchema } from '../theme/theme.schema';

/**
 * A personalization variable (merge tag). Block text can reference it as
 * `{{key}}`; the `sample` value is used to render realistic previews and test
 * sends, while the exported HTML keeps the raw `{{key}}` token.
 */
export const templateVariableSchema = z.object({
  key: z.string().regex(/^[A-Za-z0-9_]+$/, 'Use letters, numbers or underscore'),
  label: z.string().min(1).max(80),
  sample: z.string().max(200),
});

/**
 * A personalization variable.
 */
export type TemplateVariable = z.infer<typeof templateVariableSchema>;

/**
 * A complete, self-contained email template: a name, an optional description, a
 * theme, an ordered list of blocks and optional personalization variables. This
 * is the payload exchanged between the frontend builder, the API and the render
 * engine.
 */
export const templateDocumentSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  theme: themeSchema,
  blocks: z.array(blockSchema),
  variables: z.array(templateVariableSchema).optional(),
});

/**
 * A validated email template document.
 */
export type TemplateDocument = z.infer<typeof templateDocumentSchema>;

/**
 * Parses and validates an unknown value as a {@link TemplateDocument}, throwing
 * a `ZodError` if it is invalid.
 *
 * @param input - The value to validate.
 * @returns The validated template document.
 */
export function parseTemplateDocument(input: unknown): TemplateDocument {
  return templateDocumentSchema.parse(input);
}

/**
 * Safely validates an unknown value as a {@link TemplateDocument} without
 * throwing.
 *
 * @param input - The value to validate.
 * @returns A Zod safe-parse result.
 */
export function safeParseTemplateDocument(
  input: unknown,
): z.SafeParseReturnType<unknown, TemplateDocument> {
  return templateDocumentSchema.safeParse(input);
}
