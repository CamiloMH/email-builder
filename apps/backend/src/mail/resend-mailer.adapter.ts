import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import type { Mailer, MailMessage } from './mailer.port';

/** Default verified sender used when `MAIL_FROM` is not configured. */
const DEFAULT_FROM = 'onboarding@resend.dev';

/**
 * Adapter implementing the {@link Mailer} port with Resend. When
 * `RESEND_API_KEY` is absent (local/dev/test) it logs and no-ops instead of
 * failing, so the feature is usable without credentials.
 */
@Injectable()
export class ResendMailerAdapter implements Mailer {
  private readonly logger = new Logger(ResendMailerAdapter.name);
  private readonly client: Resend | null;
  private readonly from: string;

  /**
   * @param config - Configuration service providing `RESEND_API_KEY`/`MAIL_FROM`.
   */
  constructor(config: ConfigService) {
    const apiKey = config.get<string>('RESEND_API_KEY');
    this.from = config.get<string>('MAIL_FROM') ?? DEFAULT_FROM;
    this.client = apiKey ? new Resend(apiKey) : null;
  }

  /**
   * @inheritdoc
   */
  async sendEmail(message: MailMessage): Promise<void> {
    if (!this.client) {
      this.logger.warn(
        `RESEND_API_KEY not set — skipping test email to ${message.to} ("${message.subject}").`,
      );
      return;
    }
    const { error } = await this.client.emails.send({
      from: this.from,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });
    if (error) {
      throw new Error(`Resend failed to send the email: ${error.message}`);
    }
  }
}
