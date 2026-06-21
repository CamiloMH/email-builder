import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FAVORITES_KEY, useFavoritesStore } from './favorites-store';

describe('favorites store', () => {
  beforeEach(() => {
    localStorage.clear();
    useFavoritesStore.setState({ ids: [] });
  });
  afterEach(() => localStorage.clear());

  it('toggles a favorite on and off and persists it', () => {
    const { toggle } = useFavoritesStore.getState();

    toggle('a');
    expect(useFavoritesStore.getState().isFavorite('a')).toBe(true);
    expect(JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? '[]')).toContain('a');

    toggle('a');
    expect(useFavoritesStore.getState().isFavorite('a')).toBe(false);
    expect(JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? '[]')).not.toContain('a');
  });
});
