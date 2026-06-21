import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendTestEmail } from '../server/send-test.handler';

/**
 * Serverless test-send endpoint (Vercel). Holds the Resend API key server-side
 * and delegates to the shared {@link sendTestEmail} handler.
 *
 * Env vars (set in the hosting provider, never committed):
 * - `RESEND_API_KEY` — Resend key; when absent the endpoint is a no-op.
 * - `MAIL_FROM` — sender address (defaults to `onboarding@resend.dev`).
 */

// Read env without depending on Node's global `process` typings, so the function
// compiles regardless of the project's tsconfig (the frontend one targets the DOM
// and excludes @types/node from the global scope).
const env = ((globalThis as { process?: { env?: Record<string, string | undefined> } }).process
  ?.env ?? {}) as { RESEND_API_KEY?: string; MAIL_FROM?: string };

function clientIp(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0]?.trim() ?? 'unknown';
  }
  if (Array.isArray(forwarded)) {
    return forwarded[0] ?? 'unknown';
  }
  return req.socket.remoteAddress ?? 'unknown';
}

/**
 * Vercel handler for `POST /api/send-test`.
 *
 * @param req - The incoming request (`{ to, subject, html, text }`).
 * @param res - The response; replies with `{ sent }` or `{ code, message }`.
 */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ code: 'unknown', message: 'Method not allowed' });
    return;
  }
  const result = await sendTestEmail(req.body, clientIp(req), {
    RESEND_API_KEY: env.RESEND_API_KEY,
    MAIL_FROM: env.MAIL_FROM,
  });
  res.status(result.status).json(result.body);
}
