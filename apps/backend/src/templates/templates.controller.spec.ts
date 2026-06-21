import { createDefaultTemplate } from '@email/core';
import { TemplatesController } from './templates.controller';
import type { TemplatesService } from './templates.service';

describe('TemplatesController', () => {
  let service: jest.Mocked<
    Pick<TemplatesService, 'findAll' | 'findOne' | 'create' | 'update' | 'remove'>
  >;
  let controller: TemplatesController;

  beforeEach(() => {
    service = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    controller = new TemplatesController(service as unknown as TemplatesService);
  });

  it('delegates findAll with the owner key', () => {
    void controller.findAll('owner-1');
    expect(service.findAll).toHaveBeenCalledWith('owner-1');
  });

  it('delegates findOne with id and owner', () => {
    void controller.findOne('id-1', 'owner-1');
    expect(service.findOne).toHaveBeenCalledWith('id-1', 'owner-1');
  });

  it('delegates create with dto and owner', () => {
    const dto = createDefaultTemplate();
    void controller.create(dto as never, 'owner-1');
    expect(service.create).toHaveBeenCalledWith(dto, 'owner-1');
  });

  it('delegates update with id, dto and owner', () => {
    const dto = createDefaultTemplate();
    void controller.update('id-1', dto as never, 'owner-1');
    expect(service.update).toHaveBeenCalledWith('id-1', dto, 'owner-1');
  });

  it('delegates remove with id and owner', () => {
    void controller.remove('id-1', 'owner-1');
    expect(service.remove).toHaveBeenCalledWith('id-1', 'owner-1');
  });
});
