import type { Request } from 'express';
import { ANONYMOUS_OWNER, OwnerStrategyName } from './owner.constants';
import type { OwnerIdentificationStrategy } from './owner-identification.strategy';
import { OwnerService } from './owner.service';
import { hashOwnerKey } from './owner.util';

const request = {} as Request;

const strategy = (name: OwnerStrategyName, value: string | null): OwnerIdentificationStrategy => ({
  name,
  resolve: () => value,
});

describe('OwnerService', () => {
  it('hashes the first non-null strategy result (client id wins)', () => {
    const service = new OwnerService([
      strategy(OwnerStrategyName.ClientId, 'client-123'),
      strategy(OwnerStrategyName.Ip, '203.0.113.1'),
    ]);
    expect(service.resolve(request)).toBe(hashOwnerKey('client-123'));
  });

  it('falls back to the next strategy when the first returns null', () => {
    const service = new OwnerService([
      strategy(OwnerStrategyName.ClientId, null),
      strategy(OwnerStrategyName.Ip, '203.0.113.1'),
    ]);
    expect(service.resolve(request)).toBe(hashOwnerKey('203.0.113.1'));
  });

  it('falls back to an anonymous key when no strategy resolves', () => {
    const service = new OwnerService([
      strategy(OwnerStrategyName.ClientId, null),
      strategy(OwnerStrategyName.Ip, null),
    ]);
    expect(service.resolve(request)).toBe(hashOwnerKey(ANONYMOUS_OWNER));
  });
});
