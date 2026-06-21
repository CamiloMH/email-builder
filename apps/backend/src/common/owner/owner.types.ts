import type { Request } from 'express';

/**
 * An Express request augmented with the resolved owner key by the
 * {@link OwnerMiddleware}.
 */
export interface RequestWithOwner extends Request {
  /** The opaque owner key identifying the visitor. */
  ownerKey?: string;
}
