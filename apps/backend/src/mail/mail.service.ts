import { ApiErrorCode, personalizeDocument } from '@email/core';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ApiException } from '../common/errors/api-exception';
import { EMAIL_RENDERER, type EmailRenderer } from '../render/email-renderer.port';
import { TemplatesService } from '../templates/templates.service';
import { MAILER, type Mailer } from './mailer.port';

/**
 * Application service that renders a stored template (with its sample
 * personalization values) and sends it as a test email to the requester.
 */
@Injectable()
export class MailService {
  /**
   * @param mailer - The mailer port.
   * @param renderer - The email renderer port.
   * @param templatesService - Loads stored, owner-scoped templates.
   */
  constructor(
    @Inject(MAILER) private readonly mailer: Mailer,
    @Inject(EMAIL_RENDERER) private readonly renderer: EmailRenderer,
    private readonly templatesService: TemplatesService,
  ) {}

  /**
   * Renders an owned template with its sample data and emails it to `to`.
   *
   * @param id - The template id.
   * @param ownerKey - The resolved owner key.
   * @param to - The recipient address.
   */
  async sendTest(id: string, ownerKey: string, to: string): Promise<void> {
    const document = await this.templatesService.findDocument(id, ownerKey);
    const personalized = personalizeDocument(document);
    const { html, text } = await this.renderer.render(personalized);
    try {
      await this.mailer.sendEmail({ to, subject: `[Prueba] ${document.name}`, html, text });
    } catch (error) {
      throw new ApiException(
        ApiErrorCode.MailSendFailed,
        HttpStatus.BAD_GATEWAY,
        error instanceof Error ? error.message : undefined,
      );
    }
  }
}
