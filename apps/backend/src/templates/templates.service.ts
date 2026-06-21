import { ApiErrorCode, type TemplateDocument } from '@email/core';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { TemplateResponse } from './dto/template-response.dto';
import { TemplateEntity } from './template.entity';
import { TemplateMapper } from './template.mapper';

/**
 * Application service for template CRUD. Every operation is scoped by `ownerKey`
 * so a visitor can only access their own templates.
 */
@Injectable()
export class TemplatesService {
  /**
   * @param repository - The TypeORM repository for templates.
   */
  constructor(
    @InjectRepository(TemplateEntity)
    private readonly repository: Repository<TemplateEntity>,
  ) {}

  /**
   * Lists the owner's templates, most recently updated first.
   *
   * @param ownerKey - The owner key.
   * @returns The owner's templates.
   */
  async findAll(ownerKey: string): Promise<TemplateResponse[]> {
    const entities = await this.repository.find({
      where: { ownerKey },
      order: { updatedAt: 'DESC' },
    });
    return entities.map((entity) => TemplateMapper.toResponse(entity));
  }

  /**
   * Returns a single owned template.
   *
   * @param id - The template id.
   * @param ownerKey - The owner key.
   * @returns The template.
   */
  async findOne(id: string, ownerKey: string): Promise<TemplateResponse> {
    return TemplateMapper.toResponse(await this.getOwned(id, ownerKey));
  }

  /**
   * Returns a single owned template as a renderable domain document.
   *
   * @param id - The template id.
   * @param ownerKey - The owner key.
   * @returns The renderable document.
   */
  async findDocument(id: string, ownerKey: string): Promise<TemplateDocument> {
    return TemplateMapper.toDocument(await this.getOwned(id, ownerKey));
  }

  /**
   * Creates a template owned by the given owner.
   *
   * @param document - The template document.
   * @param ownerKey - The owner key.
   * @returns The created template.
   */
  async create(document: TemplateDocument, ownerKey: string): Promise<TemplateResponse> {
    const entity = TemplateMapper.applyDocument(this.repository.create(), document, ownerKey);
    return TemplateMapper.toResponse(await this.repository.save(entity));
  }

  /**
   * Replaces an owned template.
   *
   * @param id - The template id.
   * @param document - The new template document.
   * @param ownerKey - The owner key.
   * @returns The updated template.
   */
  async update(
    id: string,
    document: TemplateDocument,
    ownerKey: string,
  ): Promise<TemplateResponse> {
    const entity = await this.getOwned(id, ownerKey);
    TemplateMapper.applyDocument(entity, document, ownerKey);
    return TemplateMapper.toResponse(await this.repository.save(entity));
  }

  /**
   * Deletes an owned template.
   *
   * @param id - The template id.
   * @param ownerKey - The owner key.
   */
  async remove(id: string, ownerKey: string): Promise<void> {
    const result = await this.repository.delete({ id, ownerKey });
    if (!result.affected) {
      throw new NotFoundException({
        statusCode: 404,
        code: ApiErrorCode.TemplateNotFound,
        message: `Template ${id} not found`,
      });
    }
  }

  /**
   * Fetches an owned entity or throws `NotFoundException`.
   *
   * @param id - The template id.
   * @param ownerKey - The owner key.
   * @returns The owned entity.
   */
  private async getOwned(id: string, ownerKey: string): Promise<TemplateEntity> {
    const entity = await this.repository.findOne({ where: { id, ownerKey } });
    if (!entity) {
      throw new NotFoundException({
        statusCode: 404,
        code: ApiErrorCode.TemplateNotFound,
        message: `Template ${id} not found`,
      });
    }
    return entity;
  }
}
