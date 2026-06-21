import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Response } from 'express';
import { OwnerService } from './owner.service';
import type { RequestWithOwner } from './owner.types';

/**
 * Middleware that resolves the visitor's owner key once per request and attaches
 * it to the request, where the {@link CurrentOwner} decorator reads it.
 */
@Injectable()
export class OwnerMiddleware implements NestMiddleware {
  /**
   * @param ownerService - The service that resolves the owner key.
   */
  constructor(private readonly ownerService: OwnerService) {}

  /**
   * Attaches the resolved owner key to the request and continues.
   *
   * @param request - The incoming request.
   * @param _response - The outgoing response (unused).
   * @param next - The next middleware in the chain.
   */
  use(request: RequestWithOwner, _response: Response, next: NextFunction): void {
    request.ownerKey = this.ownerService.resolve(request);
    next();
  }
}
