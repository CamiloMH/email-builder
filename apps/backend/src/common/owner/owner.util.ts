import { createHash } from 'node:crypto';

/**
 * Hashes a raw owner identifier (client id or IP) into an opaque, fixed-length
 * key suitable for storage and lookups. Keeps personally-identifiable values
 * (like IPs) out of the database.
 *
 * @param value - The raw identifier to hash.
 * @returns A 32-character hexadecimal owner key.
 */
export function hashOwnerKey(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 32);
}
