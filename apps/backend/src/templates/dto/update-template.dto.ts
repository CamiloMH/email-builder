import { templateDocumentSchema } from '@email/core';
import { createZodDto } from 'nestjs-zod';

/**
 * Body DTO for replacing a template (full update). Validated against the shared
 * `templateDocumentSchema`.
 */
export class UpdateTemplateDto extends createZodDto(templateDocumentSchema) {}
