import type { TemplateDocument } from '@email/core';
import type { TemplateResponse } from './dto/template-response.dto';
import type { TemplateEntity } from './template.entity';

/**
 * Adapter (structural design pattern) translating between the persistence entity
 * ({@link TemplateEntity}) and the domain/API shapes ({@link TemplateDocument},
 * {@link TemplateResponse}). Keeps the domain and the database decoupled.
 */
export const TemplateMapper = {
  /**
   * Maps a persisted entity to the API response shape.
   *
   * @param entity - The persisted template entity.
   * @returns The API response object.
   */
  toResponse(entity: TemplateEntity): TemplateResponse {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description ?? undefined,
      theme: entity.theme,
      blocks: entity.blocks,
      variables: entity.variables ?? undefined,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  },

  /**
   * Maps a persisted entity to the renderable domain document.
   *
   * @param entity - The persisted template entity.
   * @returns The domain template document.
   */
  toDocument(entity: TemplateEntity): TemplateDocument {
    return {
      name: entity.name,
      description: entity.description ?? undefined,
      theme: entity.theme,
      blocks: entity.blocks,
      variables: entity.variables ?? undefined,
    };
  },

  /**
   * Applies a domain document onto an entity (for create/update).
   *
   * @param entity - The entity to mutate.
   * @param document - The source document.
   * @param ownerKey - The owner key to assign.
   * @returns The mutated entity.
   */
  applyDocument(
    entity: TemplateEntity,
    document: TemplateDocument,
    ownerKey: string,
  ): TemplateEntity {
    entity.name = document.name;
    entity.description = document.description ?? null;
    entity.theme = document.theme;
    entity.blocks = document.blocks;
    entity.variables = document.variables ?? null;
    entity.ownerKey = ownerKey;
    return entity;
  },
};
