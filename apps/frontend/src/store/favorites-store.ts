import { create } from 'zustand';

/** localStorage key for the set of favorite template ids. */
export const FAVORITES_KEY = 'email-builder-favorites';

/** Reads the favorite ids from localStorage. */
function loadFavorites(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

/**
 * State and actions for favorite templates, persisted per visitor in
 * localStorage (the same scope as the anonymous client id).
 */
export interface FavoritesState {
  /** The favorite template ids. */
  ids: string[];
  /** Whether a template is a favorite. */
  isFavorite: (id: string) => boolean;
  /** Toggles a template's favorite state and persists it. */
  toggle: (id: string) => void;
}

/**
 * Zustand store backing favorite templates.
 */
export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  ids: loadFavorites(),
  isFavorite: (id) => get().ids.includes(id),
  toggle: (id) =>
    set((state) => {
      const ids = state.ids.includes(id)
        ? state.ids.filter((favorite) => favorite !== id)
        : [...state.ids, id];
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
      } catch {
        // Ignore storage errors.
      }
      return { ids };
    }),
}));
