import { afterEach, describe, expect, it } from 'vitest';
import { CLIENT_ID_STORAGE_KEY, getClientId } from './client-id';

describe('getClientId', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('generates and persists a client id on first use', () => {
    expect(localStorage.getItem(CLIENT_ID_STORAGE_KEY)).toBeNull();
    const id = getClientId();
    expect(id).toBeTruthy();
    expect(localStorage.getItem(CLIENT_ID_STORAGE_KEY)).toBe(id);
  });

  it('returns the same id on subsequent calls', () => {
    expect(getClientId()).toBe(getClientId());
  });
});
