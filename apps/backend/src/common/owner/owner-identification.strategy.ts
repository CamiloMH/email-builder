import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { OwnerHeader, OwnerStrategyName } from './owner.constants';

/**
 * Strategy (behavioural design pattern) that attempts to identify the visitor
 * who made a request. Implementations return a raw identifier or `null` if they
 * cannot resolve one. The {@link OwnerService} tries them in order.
 */
export interface OwnerIdentificationStrategy {
  /** The strategy name, for diagnostics. */
  readonly name: OwnerStrategyName;
  /**
   * Resolves a raw owner identifier from the request.
   *
   * @param request - The incoming request.
   * @returns The raw identifier, or `null` if this strategy cannot resolve one.
   */
  resolve(request: Request): string | null;
}

/**
 * Reads the first value of a possibly-array header.
 *
 * @param value - The raw header value.
 * @returns The first value, or `undefined`.
 */
function firstHeaderValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Identifies a visitor by the anonymous `x-client-id` header sent by the
 * frontend (persisted in `localStorage`), surviving IP changes.
 */
@Injectable()
export class ClientIdOwnerStrategy implements OwnerIdentificationStrategy {
  readonly name = OwnerStrategyName.ClientId;

  /**
   * @inheritdoc
   */
  resolve(request: Request): string | null {
    const value = firstHeaderValue(request.headers[OwnerHeader.ClientId])?.trim();
    return value && value.length > 0 ? value : null;
  }
}

/**
 * Identifies a visitor by their IP address, resolving `x-forwarded-for` when
 * behind a proxy.
 */
@Injectable()
export class IpOwnerStrategy implements OwnerIdentificationStrategy {
  readonly name = OwnerStrategyName.Ip;

  /**
   * @inheritdoc
   */
  resolve(request: Request): string | null {
    const forwarded = firstHeaderValue(request.headers[OwnerHeader.ForwardedFor]);
    const candidate =
      forwarded?.split(',')[0]?.trim() || request.ip || request.socket?.remoteAddress || '';
    return candidate.length > 0 ? candidate : null;
  }
}
