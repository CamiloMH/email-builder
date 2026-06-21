import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { RequestWithOwner } from './owner.types';

/**
 * Extracts the resolved owner key from the request. Exported separately so it
 * can be unit-tested without the decorator machinery.
 *
 * @param _data - Unused decorator metadata.
 * @param context - The execution context.
 * @returns The resolved owner key, or an empty string if absent.
 */
export const currentOwnerFactory = (_data: unknown, context: ExecutionContext): string => {
  const request = context.switchToHttp().getRequest<RequestWithOwner>();
  return request.ownerKey ?? '';
};

/**
 * Parameter decorator that injects the resolved owner key for the current
 * request (set by the {@link OwnerMiddleware}).
 *
 * @example
 * ```ts
 * findAll(@CurrentOwner() ownerKey: string) { ... }
 * ```
 */
export const CurrentOwner = createParamDecorator(currentOwnerFactory);
