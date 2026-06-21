import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiFetch } from './api-client';

describe('apiFetch', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('attaches JSON and client-id headers and returns parsed JSON', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ value: 42 }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await apiFetch<{ value: number }>('/things');

    expect(result).toEqual({ value: 42 });
    const init = (fetchMock.mock.calls[0]?.[1] ?? {}) as { headers: Record<string, string> };
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(init.headers['x-client-id']).toBeTruthy();
  });

  it('returns undefined for 204 responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 204 }));
    await expect(apiFetch<void>('/things/1', { method: 'DELETE' })).resolves.toBeUndefined();
  });

  it('throws ApiError with the status on failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    await expect(apiFetch('/missing')).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
    });
    await expect(apiFetch('/missing')).rejects.toBeInstanceOf(ApiError);
  });
});
