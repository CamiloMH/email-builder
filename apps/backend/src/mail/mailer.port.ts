/**
 * DI token for the {@link Mailer} port.
 */
export const MAILER = Symbol('MAILER');

/**
 * An email message ready to be delivered.
 */
export interface MailMessage {
  /** Recipient address. */
  to: string;
  /** Subject line. */
  subject: string;
  /** HTML body. */
  html: string;
  /** Plain-text body. */
  text: string;
}

/**
 * Port (hexagonal architecture) abstracting email delivery, so the domain does
 * not depend on a concrete provider. Implemented by {@link ResendMailerAdapter}.
 */
export interface Mailer {
  /**
   * Delivers an email message.
   *
   * @param message - The message to send.
   */
  sendEmail(message: MailMessage): Promise<void>;
}
