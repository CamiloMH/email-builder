import { createDefaultTemplate } from '@email/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../lib/api-client';
import { SEND_ENDPOINT, templatesApi } from './templates.api';

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe('templatesApi (localStorage persistence)', () => {
  it('creates, lists and gets a template', async () => {
    const created = await templatesApi.create(createDefaultTemplate());
    expect(created.id).toBeTruthy();
    expect(await templatesApi.list()).toHaveLength(1);
    expect((await templatesApi.get(created.id)).name).toBe(created.name);
  });

  it('updates a template keeping its id', async () => {
    const created = await templatesApi.create(createDefaultTemplate());
    const updated = await templatesApi.update(created.id, {
      ...createDefaultTemplate(),
      name: 'Renombrada',
    });
    expect(updated.id).toBe(created.id);
    expect(updated.name).toBe('Renombrada');
  });

  it('removes a template', async () => {
    const created = await templatesApi.create(createDefaultTemplate());
    await templatesApi.remove(created.id);
    expect(await templatesApi.list()).toHaveLength(0);
  });

  it('rejects with ApiError when the template is missing', async () => {
    await expect(templatesApi.get('missing')).rejects.toBeInstanceOf(ApiError);
  });
});

describe('templatesApi.sendTest (serverless)', () => {
  it('posts the rendered email to the send endpoint', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: () => Promise.resolve({ sent: true }) });
    vi.stubGlobal('fetch', fetchMock);

    const result = await templatesApi.sendTest({
      to: 'tester@example.com',
      subject: 'Hi',
      html: '<p>hi</p>',
      text: 'hi',
    });

    expect(result.sent).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(SEND_ENDPOINT, expect.objectContaining({ method: 'POST' }));
  });

  it('throws ApiError when the send fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        json: () => Promise.resolve({ code: 'rateLimited' }),
      }),
    );
    await expect(
      templatesApi.sendTest({ to: 'a@b.com', subject: 'S', html: 'x', text: 'x' }),
    ).rejects.toBeInstanceOf(ApiError);
  });
});
