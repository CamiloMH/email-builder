import { templateDocumentSchema } from '@email/core';
import { createZodDto } from 'nestjs-zod';

/**
 * Body DTO for the ad-hoc render endpoint: a full template document to render
 * without persisting it (used by the live preview).
 */
export class RenderTemplateDto extends createZodDto(templateDocumentSchema) {}
