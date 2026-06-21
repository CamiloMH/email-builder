import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

/**
 * Serverless test-send endpoint (Vercel). Self-contained on purpose: it imports
 * only node_modules (no project-relative files), so Vercel never has to resolve a
 * sibling module at runtime. The shared logic is exported as {@link sendTestEmail}
 * and reused by the Vite dev middleware and the unit test.
 *
 * Env vars (set in the hosting provider, never committed):
 * - `RESEND_API_KEY` — Resend key; when absent the endpoint is a no-op.
 * - `MAIL_FROM` — sender address (defaults to `onboarding@resend.dev`).
 */

// In-memory per-IP rate limiter. State lives per process, so it throttles bursts
// cheaply with no external store. For strict global limits, back this with
// Upstash/Vercel KV.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((time) => now - time < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Server-side configuration for the email provider. */
export interface SendTestEnv {
  RESEND_API_KEY?: string;
  MAIL_FROM?: string;
}

/** Result of {@link sendTestEmail}: an HTTP status and a JSON body. */
export interface SendTestResult {
  status: number;
  body: Record<string, unknown>;
}

/**
 * Validates, rate-limits and sends a pre-rendered test email via Resend.
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

// Read env without depending on Node's global `process` typings, so the function
// compiles regardless of the project's tsconfig (the frontend one targets the DOM
// and excludes @types/node from the global scope).
const env = ((globalThis as { process?: { env?: Record<string, string | undefined> } }).process
  ?.env ?? {}) as SendTestEnv;

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
