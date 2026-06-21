import { afterEach, describe, expect, it, vi } from 'vitest';
import { generateId } from './id';

describe('generateId', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns a non-empty string', () => {
    expect(generateId()).toBeTypeOf('string');
    expect(generateId().length).toBeGreaterThan(0);
  });

  it('returns unique values across calls', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });

  it('uses the Web Crypto randomUUID when available', () => {
    const randomUUID = vi.fn(() => '11111111-1111-1111-1111-111111111111');
    vi.stubGlobal('crypto', { randomUUID });
    expect(generateId()).toBe('11111111-1111-1111-1111-111111111111');
    expect(randomUUID).toHaveBeenCalledOnce();
  });

  it('falls back to a random id when crypto is unavailable', () => {
    vi.stubGlobal('crypto', undefined);
    expect(generateId()).toMatch(/^id-/);
  });
});
