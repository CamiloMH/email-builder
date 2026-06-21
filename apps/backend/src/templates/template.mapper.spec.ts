import { BlockFactory, BlockType, DEFAULT_THEME, createDefaultTemplate } from '@email/core';
import { TemplateEntity } from './template.entity';
import { TemplateMapper } from './template.mapper';

const baseEntity = (): TemplateEntity => {
  const entity = new TemplateEntity();
  entity.id = '11111111-1111-1111-1111-111111111111';
  entity.name = 'Newsletter';
  entity.description = 'A description';
  entity.theme = DEFAULT_THEME;
  entity.blocks = [BlockFactory.create(BlockType.Header)];
  entity.ownerKey = 'owner-1';
  entity.createdAt = new Date('2024-01-01T00:00:00.000Z');
  entity.updatedAt = new Date('2024-01-02T00:00:00.000Z');
  return entity;
};

describe('TemplateMapper', () => {
  it('maps an entity to the API response with ISO timestamps', () => {
    const response = TemplateMapper.toResponse(baseEntity());
    expect(response.id).toBe('11111111-1111-1111-1111-111111111111');
    expect(response.description).toBe('A description');
    expect(response.createdAt).toBe('2024-01-01T00:00:00.000Z');
    expect(response.updatedAt).toBe('2024-01-02T00:00:00.000Z');
  });

  it('converts a null description to undefined', () => {
    const entity = baseEntity();
    entity.description = null;
    expect(TemplateMapper.toResponse(entity).description).toBeUndefined();
    expect(TemplateMapper.toDocument(entity).description).toBeUndefined();
  });

  it('maps an entity to a renderable document', () => {
    const entity = baseEntity();
    const document = TemplateMapper.toDocument(entity);
    expect(document).toEqual({
      name: 'Newsletter',
      description: 'A description',
      theme: DEFAULT_THEME,
      blocks: entity.blocks,
    });
  });

  it('applies a document onto an entity, including the owner key', () => {
    const entity = new TemplateEntity();
    const document = createDefaultTemplate('Promo');
    TemplateMapper.applyDocument(entity, document, 'owner-9');
    expect(entity.name).toBe('Promo');
    expect(entity.ownerKey).toBe('owner-9');
    expect(entity.blocks).toBe(document.blocks);
  });

  it('stores a missing description as null', () => {
    const entity = new TemplateEntity();
    TemplateMapper.applyDocument(
      entity,
      { ...createDefaultTemplate(), description: undefined },
      'o',
    );
    expect(entity.description).toBeNull();
  });
});
