import { hashOwnerKey } from './owner.util';

describe('hashOwnerKey', () => {
  it('is deterministic and 32 characters long', () => {
    expect(hashOwnerKey('visitor-1')).toBe(hashOwnerKey('visitor-1'));
    expect(hashOwnerKey('visitor-1')).toHaveLength(32);
  });

  it('produces different keys for different inputs', () => {
    expect(hashOwnerKey('a')).not.toBe(hashOwnerKey('b'));
  });
});
