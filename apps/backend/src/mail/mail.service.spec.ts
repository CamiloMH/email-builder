import { createDefaultTemplate } from '@email/core';
import type { EmailRenderer } from '../render/email-renderer.port';
import type { TemplatesService } from '../templates/templates.service';
import { MailService } from './mail.service';
import type { Mailer } from './mailer.port';

describe('MailService', () => {
  let mailer: jest.Mocked<Mailer>;
  let renderer: jest.Mocked<EmailRenderer>;
  let templatesService: { findDocument: jest.Mock };
  let service: MailService;

  beforeEach(() => {
    mailer = { sendEmail: jest.fn().mockResolvedValue(undefined) };
    renderer = {
      render: jest.fn().mockResolvedValue({ html: '<html>hi</html>', text: 'hi' }),
      renderToReactSource: jest.fn(),
    };
    templatesService = {
      findDocument: jest.fn().mockResolvedValue(createDefaultTemplate('My Promo')),
    };
    service = new MailService(mailer, renderer, templatesService as unknown as TemplatesService);
  });

  it('loads the owned template, renders it and sends it as a test email', async () => {
    await service.sendTest('id-1', 'owner-1', 'to@example.com');

    expect(templatesService.findDocument).toHaveBeenCalledWith('id-1', 'owner-1');
    expect(renderer.render).toHaveBeenCalledTimes(1);
    expect(mailer.sendEmail).toHaveBeenCalledWith({
      to: 'to@example.com',
      subject: '[Prueba] My Promo',
      html: '<html>hi</html>',
      text: 'hi',
    });
  });
});
