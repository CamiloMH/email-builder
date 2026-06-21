import { Resend } from 'resend';

/**
 * Framework-agnostic logic for the test-send endpoint, shared by the Vercel
 * serverless function (`send-test.ts`) and the Vite dev middleware, so local
 * `pnpm dev` and production behave identically.
 */

// In-memory per-IP rate limiter. State lives per process, so it throttles bursts
// cheaply with no external store. For strict global limits, back this with
// Upstash/Vercel KV.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

/**
 * Records a request from `ip` and reports whether it exceeds the rate limit.
 *
 * @param ip - The caller's IP.
 * @returns `true` when the caller is over the limit.
 */
export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((time) => now - time < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Result of {@link sendTestEmail}: an HTTP status and a JSON body. */
export interface SendTestResult {
  status: number;
  body: Record<string, unknown>;
}

/** Server-side configuration for the email provider. */
export interface SendTestEnv {
  RESEND_API_KEY?: string;
  MAIL_FROM?: string;
}

/**
 * Validates, rate-limits and sends a pre-rendered test email via Resend. Returns
 * a transport-agnostic `{ status, body }` so any HTTP adapter can reply.
 *
 * @param payload - The request body (`{ to, subject, html, text }`).
 * @param ip - The caller's IP (for rate limiting).
 * @param env - Provider config; without `RESEND_API_KEY` the send is a no-op.
 * @returns The status and JSON body to respond with.
 */
export async function sendTestEmail(
  payload: unknown,
  ip: string,
  env: SendTestEnv,
): Promise<SendTestResult> {
  if (isRateLimited(ip)) {
    return { status: 429, body: { code: 'rateLimited', message: 'Too many requests' } };
  }

  const { to, subject, html, text } = (payload ?? {}) as Partial<{
    to: string;
    subject: string;
    html: string;
    text: string;
  }>;

  if (typeof to !== 'string' || !EMAIL_RE.test(to) || typeof html !== 'string') {
    return { status: 400, body: { code: 'validationFailed', message: 'Invalid recipient or content' } };
  }

  if (!env.RESEND_API_KEY) {
    // No-op when not configured (mirrors the previous backend behavior).
    return { status: 200, body: { sent: false } };
  }

  try {
    const { error } = await new Resend(env.RESEND_API_KEY).emails.send({
      from: env.MAIL_FROM ?? 'onboarding@resend.dev',
      to,
      subject: typeof subject === 'string' && subject.length > 0 ? subject : 'Test email',
      html,
      text: typeof text === 'string' ? text : undefined,
    });
    if (error) {
      return { status: 502, body: { code: 'mailSendFailed', message: error.message } };
    }
    return { status: 200, body: { sent: true } };
  } catch (err) {
    return { status: 502, body: { code: 'mailSendFailed', message: (err as Error).message } };
  }
}
