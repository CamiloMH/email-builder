import { templateDocumentSchema } from '@email/core';
import { createZodDto } from 'nestjs-zod';

/**
 * Body DTO for creating a template. Validated against the shared
 * `templateDocumentSchema` (name, optional description, theme and blocks).
 */
export class CreateTemplateDto extends createZodDto(templateDocumentSchema) {}
