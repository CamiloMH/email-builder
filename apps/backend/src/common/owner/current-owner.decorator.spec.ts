import type { ExecutionContext } from '@nestjs/common';
import { currentOwnerFactory } from './current-owner.decorator';
import type { RequestWithOwner } from './owner.types';

const contextFor = (request: Partial<RequestWithOwner>): ExecutionContext =>
  ({
    switchToHttp: () => ({ getRequest: () => request }),
  }) as unknown as ExecutionContext;

describe('currentOwnerFactory', () => {
  it('returns the resolved owner key', () => {
    expect(currentOwnerFactory(undefined, contextFor({ ownerKey: 'owner-1' }))).toBe('owner-1');
  });

  it('returns an empty string when no owner key is present', () => {
    expect(currentOwnerFactory(undefined, contextFor({}))).toBe('');
  });
});
