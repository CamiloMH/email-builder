import { Inject, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { ANONYMOUS_OWNER, OWNER_STRATEGIES } from './owner.constants';
import type { OwnerIdentificationStrategy } from './owner-identification.strategy';
import { hashOwnerKey } from './owner.util';

/**
 * Resolves the opaque owner key for a request by trying each registered
 * {@link OwnerIdentificationStrategy} in order (client id first, then IP) and
 * hashing the first raw identifier found. Falls back to an anonymous key.
 */
@Injectable()
export class OwnerService {
  /**
   * @param strategies - The ordered owner-identification strategies.
   */
  constructor(
    @Inject(OWNER_STRATEGIES)
    private readonly strategies: readonly OwnerIdentificationStrategy[],
  ) {}

  /**
   * Resolves the opaque owner key for a request.
   *
   * @param request - The incoming request.
   * @returns A hashed, opaque owner key.
   */
  resolve(request: Request): string {
    for (const strategy of this.strategies) {
      const value = strategy.resolve(request);
      if (value) {
        return hashOwnerKey(value);
      }
    }
    return hashOwnerKey(ANONYMOUS_OWNER);
  }
}
