import { beforeEach, describe, expect, it, vi } from 'vitest';

const sendMock = vi.hoisted(() => vi.fn());
vi.mock('resend', () => ({
  Resend: vi.fn(() => ({ emails: { send: sendMock } })),
}));

// Imports the shared logic from the Vercel function (kept outside api/ so Vercel
// does not turn this test into a serverless function).
import { sendTestEmail } from '../api/send-test';

const validPayload = { to: 'a@b.com', subject: 'S', html: '<p>x</p>', text: 'x' };

beforeEach(() => {
  sendMock.mockReset();
  sendMock.mockResolvedValue({ error: null });
});

describe('sendTestEmail', () => {
  it('no-ops with 200 sent:false when no API key is configured', async () => {
    const result = await sendTestEmail(validPayload, 'ip-noop', {});
    expect(result).toEqual({ status: 200, body: { sent: false } });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('rejects an invalid recipient with 400 validationFailed', async () => {
    const result = await sendTestEmail({ ...validPayload, to: 'nope' }, 'ip-400', {
      RESEND_API_KEY: 'k',
    });
    expect(result.status).toBe(400);
    expect(result.body.code).toBe('validationFailed');
  });

  it('sends and returns 200 sent:true when configured', async () => {
    const result = await sendTestEmail(validPayload, 'ip-ok', {
      RESEND_API_KEY: 'k',
      MAIL_FROM: 'me@x.com',
    });
    expect(result).toEqual({ status: 200, body: { sent: true } });
    expect(sendMock).toHaveBeenCalledOnce();
  });

  it('maps a provider error to 502 mailSendFailed', async () => {
    sendMock.mockResolvedValue({ error: { message: 'boom' } });
    const result = await sendTestEmail(validPayload, 'ip-502', { RESEND_API_KEY: 'k' });
    expect(result.status).toBe(502);
    expect(result.body.code).toBe('mailSendFailed');
  });

  it('rate-limits after the threshold', async () => {
    let last: { status: number; body: Record<string, unknown> } | undefined;
    for (let i = 0; i < 7; i += 1) {
      last = await sendTestEmail(validPayload, 'ip-rate', { RESEND_API_KEY: 'k' });
    }
    expect(last?.status).toBe(429);
    expect(last?.body.code).toBe('rateLimited');
  });
});
