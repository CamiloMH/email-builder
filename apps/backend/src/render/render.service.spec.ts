import { ExportFormat, createDefaultTemplate, type TemplateDocument } from '@email/core';
import type { RenderedEmail } from '@email/emails';
import type { TemplatesService } from '../templates/templates.service';
import type { EmailRenderer } from './email-renderer.port';
import { RenderService } from './render.service';

const rendered: RenderedEmail = { html: '<html>body</html>', text: 'body' };

describe('RenderService', () => {
  let renderer: jest.Mocked<EmailRenderer>;
  let templatesService: { findDocument: jest.Mock };
  let service: RenderService;

  beforeEach(() => {
    renderer = {
      render: jest.fn().mockResolvedValue(rendered),
      renderToReactSource: jest.fn().mockReturnValue('export default Email;'),
    };
    templatesService = { findDocument: jest.fn() };
    service = new RenderService(renderer, templatesService as unknown as TemplatesService);
  });

  it('renders an ad-hoc document via the renderer port', async () => {
    const document: TemplateDocument = createDefaultTemplate();
    await expect(service.renderDocument(document)).resolves.toEqual(rendered);
    expect(renderer.render).toHaveBeenCalledWith(document);
  });

  it('exports a stored template as HTML', async () => {
    templatesService.findDocument.mockResolvedValue(createDefaultTemplate('My Promo!'));
    const result = await service.exportTemplate('id-1', 'owner-1', ExportFormat.Html);
    expect(result.content).toBe(rendered.html);
    expect(result.contentType).toBe('text/html');
    expect(result.filename).toBe('my-promo.html');
  });

  it('exports a stored template as plain text', async () => {
    templatesService.findDocument.mockResolvedValue(createDefaultTemplate('My Promo!'));
    const result = await service.exportTemplate('id-1', 'owner-1', ExportFormat.Text);
    expect(result.content).toBe(rendered.text);
    expect(result.contentType).toBe('text/plain');
    expect(result.filename).toBe('my-promo.txt');
  });

  it('falls back to a default filename when the name has no slug characters', async () => {
    templatesService.findDocument.mockResolvedValue(createDefaultTemplate('!!!'));
    const result = await service.exportTemplate('id-1', 'owner-1', ExportFormat.Html);
    expect(result.filename).toBe('email.html');
  });

  it('exports a stored template as a React component without rendering HTML', async () => {
    templatesService.findDocument.mockResolvedValue(createDefaultTemplate('My Promo!'));
    const result = await service.exportTemplate('id-1', 'owner-1', ExportFormat.React);
    expect(result.content).toBe('export default Email;');
    expect(result.contentType).toBe('text/plain; charset=utf-8');
    expect(result.filename).toBe('my-promo.tsx');
    expect(renderer.renderToReactSource).toHaveBeenCalledTimes(1);
    expect(renderer.render).not.toHaveBeenCalled();
  });

  it('exports the raw document as JSON without rendering', async () => {
    templatesService.findDocument.mockResolvedValue(createDefaultTemplate('My Promo!'));
    const result = await service.exportTemplate('id-1', 'owner-1', ExportFormat.Json);
    expect(result.contentType).toBe('application/json');
    expect(result.filename).toBe('my-promo.json');
    expect(JSON.parse(result.content)).toMatchObject({ name: 'My Promo!' });
    expect(renderer.render).not.toHaveBeenCalled();
  });

  it('exports the HTML markup as a Handlebars template', async () => {
    templatesService.findDocument.mockResolvedValue(createDefaultTemplate('My Promo!'));
    const result = await service.exportTemplate('id-1', 'owner-1', ExportFormat.Hbs);
    expect(result.content).toBe(rendered.html);
    expect(result.filename).toBe('my-promo.hbs');
  });

  it('exports an .eml message wrapping the rendered email', async () => {
    templatesService.findDocument.mockResolvedValue(createDefaultTemplate('My Promo!'));
    const result = await service.exportTemplate('id-1', 'owner-1', ExportFormat.Eml);
    expect(result.contentType).toBe('message/rfc822');
    expect(result.filename).toBe('my-promo.eml');
    expect(result.content).toContain('multipart/alternative');
    expect(result.content).toContain(rendered.html);
    expect(result.content).toContain('Subject: My Promo!');
  });
});
