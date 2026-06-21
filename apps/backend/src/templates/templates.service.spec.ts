import { DEFAULT_THEME, createDefaultTemplate } from '@email/core';
import { NotFoundException } from '@nestjs/common';
import type { Repository } from 'typeorm';
import { TemplateEntity } from './template.entity';
import { TemplatesService } from './templates.service';

type RepoMock = jest.Mocked<
  Pick<Repository<TemplateEntity>, 'find' | 'findOne' | 'create' | 'save' | 'delete'>
>;

const makeEntity = (overrides: Partial<TemplateEntity> = {}): TemplateEntity =>
  Object.assign(
    new TemplateEntity(),
    {
      id: 'id-1',
      name: 'Newsletter',
      description: null,
      theme: DEFAULT_THEME,
      blocks: [],
      ownerKey: 'owner-1',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-02T00:00:00.000Z'),
    },
    overrides,
  );

describe('TemplatesService', () => {
  let repository: RepoMock;
  let service: TemplatesService;

  beforeEach(() => {
    repository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(() => new TemplateEntity()),
      save: jest.fn(async (entity: TemplateEntity) =>
        Object.assign(entity, {
          id: 'id-new',
          createdAt: new Date('2024-01-01T00:00:00.000Z'),
          updatedAt: new Date('2024-01-02T00:00:00.000Z'),
        }),
      ),
      delete: jest.fn(),
    } as unknown as RepoMock;
    service = new TemplatesService(repository as unknown as Repository<TemplateEntity>);
  });

  it('lists templates scoped to the owner, newest first', async () => {
    repository.find.mockResolvedValue([makeEntity()]);
    const result = await service.findAll('owner-1');
    expect(repository.find).toHaveBeenCalledWith({
      where: { ownerKey: 'owner-1' },
      order: { updatedAt: 'DESC' },
    });
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('id-1');
  });

  it('returns a single owned template', async () => {
    repository.findOne.mockResolvedValue(makeEntity());
    await expect(service.findOne('id-1', 'owner-1')).resolves.toMatchObject({ id: 'id-1' });
  });

  it('throws NotFound when the template does not belong to the owner', async () => {
    repository.findOne.mockResolvedValue(null);
    await expect(service.findOne('id-1', 'owner-x')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns a renderable document', async () => {
    repository.findOne.mockResolvedValue(makeEntity({ name: 'Promo' }));
    await expect(service.findDocument('id-1', 'owner-1')).resolves.toMatchObject({ name: 'Promo' });
  });

  it('creates a template for the owner', async () => {
    const result = await service.create(createDefaultTemplate('Promo'), 'owner-1');
    expect(repository.save).toHaveBeenCalled();
    expect(result.name).toBe('Promo');
  });

  it('updates an owned template', async () => {
    repository.findOne.mockResolvedValue(makeEntity());
    const result = await service.update('id-1', createDefaultTemplate('Updated'), 'owner-1');
    expect(result.name).toBe('Updated');
  });

  it('throws NotFound when updating a missing template', async () => {
    repository.findOne.mockResolvedValue(null);
    await expect(service.update('id-1', createDefaultTemplate(), 'owner-x')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('removes an owned template', async () => {
    repository.delete.mockResolvedValue({ affected: 1, raw: {} });
    await expect(service.remove('id-1', 'owner-1')).resolves.toBeUndefined();
    expect(repository.delete).toHaveBeenCalledWith({ id: 'id-1', ownerKey: 'owner-1' });
  });

  it('throws NotFound when removing a missing template', async () => {
    repository.delete.mockResolvedValue({ affected: 0, raw: {} });
    await expect(service.remove('id-1', 'owner-x')).rejects.toBeInstanceOf(NotFoundException);
  });
});
