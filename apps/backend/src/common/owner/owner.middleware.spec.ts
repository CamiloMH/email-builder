import type { NextFunction, Response } from 'express';
import { OwnerMiddleware } from './owner.middleware';
import type { OwnerService } from './owner.service';
import type { RequestWithOwner } from './owner.types';

describe('OwnerMiddleware', () => {
  it('attaches the resolved owner key to the request and continues', () => {
    const ownerService = { resolve: jest.fn().mockReturnValue('owner-key') };
    const middleware = new OwnerMiddleware(ownerService as unknown as OwnerService);
    const request = {} as RequestWithOwner;
    const next: NextFunction = jest.fn();

    middleware.use(request, {} as Response, next);

    expect(request.ownerKey).toBe('owner-key');
    expect(next).toHaveBeenCalledTimes(1);
  });
});
