import { ExportFormat, createDefaultTemplate } from '@email/core';
import type { Response } from 'express';
import { RenderController } from './render.controller';
import type { RenderService } from './render.service';

describe('RenderController', () => {
  let service: jest.Mocked<Pick<RenderService, 'renderDocument' | 'exportTemplate'>>;
  let controller: RenderController;

  beforeEach(() => {
    service = {
      renderDocument: jest.fn().mockResolvedValue({ html: '<html></html>', text: 'text' }),
      exportTemplate: jest.fn().mockResolvedValue({
        content: '<html></html>',
        contentType: 'text/html',
        filename: 'promo.html',
      }),
    };
    controller = new RenderController(service as unknown as RenderService);
  });

  it('delegates ad-hoc rendering', async () => {
    const dto = createDefaultTemplate();
    await controller.render(dto as never);
    expect(service.renderDocument).toHaveBeenCalledWith(dto);
  });

  it('streams the exported file with download headers', async () => {
    const response = { setHeader: jest.fn(), send: jest.fn() } as unknown as Response;
    await controller.export('id-1', ExportFormat.Html, 'owner-1', response);

    expect(service.exportTemplate).toHaveBeenCalledWith('id-1', 'owner-1', ExportFormat.Html);
    expect(response.setHeader).toHaveBeenCalledWith('Content-Type', 'text/html');
    expect(response.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      'attachment; filename="promo.html"',
    );
    expect(response.send).toHaveBeenCalledWith('<html></html>');
  });
});
