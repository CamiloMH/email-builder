import { DEFAULT_THEME } from '@email/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { BRAND_KITS_KEY, useBrandKitsStore } from './brand-kits-store';

const store = () => useBrandKitsStore.getState();

beforeEach(() => {
  localStorage.clear();
  useBrandKitsStore.setState({ kits: [] });
});

describe('brand kits store', () => {
  it('saves a theme as a named kit and persists it', () => {
    store().save('Marca A', DEFAULT_THEME);
    expect(store().kits).toHaveLength(1);
    expect(store().kits[0]?.name).toBe('Marca A');
    expect(JSON.parse(localStorage.getItem(BRAND_KITS_KEY) ?? '[]')).toHaveLength(1);
  });

  it('removes a kit by id', () => {
    store().save('Marca A', DEFAULT_THEME);
    const id = store().kits[0]?.id as string;
    store().remove(id);
    expect(store().kits).toHaveLength(0);
  });
});
