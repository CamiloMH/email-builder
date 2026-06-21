import type { ConfigService } from '@nestjs/config';
import { ResendMailerAdapter } from './resend-mailer.adapter';
import type { MailMessage } from './mailer.port';

jest.mock('resend', () => {
  const send = jest.fn();
  return { Resend: jest.fn(() => ({ emails: { send } })), __send: send };
});

const send = (jest.requireMock('resend') as { __send: jest.Mock }).__send;

const message: MailMessage = { to: 'a@b.com', subject: 'Hi', html: '<p>hi</p>', text: 'hi' };

const configWith = (values: Record<string, string | undefined>): ConfigService =>
  ({ get: (key: string) => values[key] }) as unknown as ConfigService;

describe('ResendMailerAdapter', () => {
  beforeEach(() => send.mockReset());

  it('no-ops (does not throw) when RESEND_API_KEY is not set', async () => {
    const adapter = new ResendMailerAdapter(configWith({}));
    await expect(adapter.sendEmail(message)).resolves.toBeUndefined();
    expect(send).not.toHaveBeenCalled();
  });

  it('sends via Resend using the configured sender when an API key is set', async () => {
    send.mockResolvedValue({ error: null });
    const adapter = new ResendMailerAdapter(
      configWith({ RESEND_API_KEY: 'key', MAIL_FROM: 'from@acme.com' }),
    );
    await adapter.sendEmail(message);
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ from: 'from@acme.com', to: 'a@b.com' }));
  });

  it('throws when Resend returns an error', async () => {
    send.mockResolvedValue({ error: { message: 'bad recipient' } });
    const adapter = new ResendMailerAdapter(configWith({ RESEND_API_KEY: 'key' }));
    await expect(adapter.sendEmail(message)).rejects.toThrow('bad recipient');
  });
});
