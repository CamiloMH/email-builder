/**
 * Generates a unique identifier, preferring the platform Web Crypto
 * `randomUUID` (available on Node >= 20 and modern browsers) and falling back to
 * a best-effort random string when it is unavailable.
 *
 * @returns A unique identifier string.
 */
export function generateId(): string {
  const cryptoObj = (
    globalThis as typeof globalThis & {
      crypto?: { randomUUID?: () => string };
    }
  ).crypto;

  if (cryptoObj?.randomUUID) {
    return cryptoObj.randomUUID();
  }

  return `id-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}
