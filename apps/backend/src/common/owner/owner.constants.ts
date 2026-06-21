/**
 * DI token for the ordered list of owner-identification strategies.
 */
export const OWNER_STRATEGIES = Symbol('OWNER_STRATEGIES');

/**
 * Enum-like `const` naming each owner-identification strategy.
 */
export const OwnerStrategyName = {
  ClientId: 'client-id',
  Ip: 'ip',
} as const;

/**
 * An owner-identification strategy name.
 */
export type OwnerStrategyName = (typeof OwnerStrategyName)[keyof typeof OwnerStrategyName];

/**
 * Enum-like `const` of the HTTP headers used to identify a visitor.
 */
export const OwnerHeader = {
  ClientId: 'x-client-id',
  ForwardedFor: 'x-forwarded-for',
} as const;

/**
 * Fallback owner identifier used when no strategy can resolve a visitor.
 */
export const ANONYMOUS_OWNER = 'anonymous';
