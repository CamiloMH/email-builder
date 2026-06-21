import type { Request } from 'express';
import { ClientIdOwnerStrategy, IpOwnerStrategy } from './owner-identification.strategy';
import { OwnerHeader } from './owner.constants';

const makeRequest = (partial: Partial<Request>): Request => partial as unknown as Request;

describe('ClientIdOwnerStrategy', () => {
  const strategy = new ClientIdOwnerStrategy();

  it('resolves the client id from the header', () => {
    const request = makeRequest({ headers: { [OwnerHeader.ClientId]: '  abc  ' } });
    expect(strategy.resolve(request)).toBe('abc');
  });

  it('uses the first value when the header is an array', () => {
    const request = makeRequest({ headers: { [OwnerHeader.ClientId]: ['first', 'second'] } });
    expect(strategy.resolve(request)).toBe('first');
  });

  it('returns null when the header is missing or blank', () => {
    expect(strategy.resolve(makeRequest({ headers: {} }))).toBeNull();
    expect(
      strategy.resolve(makeRequest({ headers: { [OwnerHeader.ClientId]: '   ' } })),
    ).toBeNull();
  });
});

describe('IpOwnerStrategy', () => {
  const strategy = new IpOwnerStrategy();

  it('resolves the first x-forwarded-for entry', () => {
    const request = makeRequest({
      headers: { [OwnerHeader.ForwardedFor]: '203.0.113.1, 70.41.3.18' },
    });
    expect(strategy.resolve(request)).toBe('203.0.113.1');
  });

  it('falls back to request.ip', () => {
    const request = makeRequest({ headers: {}, ip: '198.51.100.7' });
    expect(strategy.resolve(request)).toBe('198.51.100.7');
  });

  it('falls back to the socket remote address', () => {
    const request = makeRequest({
      headers: {},
      socket: { remoteAddress: '192.0.2.5' } as Request['socket'],
    });
    expect(strategy.resolve(request)).toBe('192.0.2.5');
  });

  it('returns null when no address is available', () => {
    const request = makeRequest({ headers: {}, socket: {} as Request['socket'] });
    expect(strategy.resolve(request)).toBeNull();
  });
});
