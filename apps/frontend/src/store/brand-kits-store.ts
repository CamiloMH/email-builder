import { generateId, type Theme } from '@email/core';
import { create } from 'zustand';

/** localStorage key for the saved brand kits. */
export const BRAND_KITS_KEY = 'email-builder-brand-kits';

/** A saved theme the user can re-apply across templates. */
export interface BrandKit {
  /** Unique identifier. */
  id: string;
  /** Display name. */
  name: string;
  /** The saved theme. */
  theme: Theme;
}

// Loads the persisted brand kits, tolerating missing/corrupt storage.
function load(): BrandKit[] {
  try {
    const raw = localStorage.getItem(BRAND_KITS_KEY);
    return raw ? (JSON.parse(raw) as BrandKit[]) : [];
  } catch {
    return [];
  }
}

// Persists brand kits, ignoring storage errors (e.g. quota/private mode).
function persist(kits: BrandKit[]): void {
  try {
    localStorage.setItem(BRAND_KITS_KEY, JSON.stringify(kits));
  } catch {
    // Ignore storage errors.
  }
}

/** State and actions for the saved brand kits. */
export interface BrandKitsState {
  /** The saved brand kits. */
  kits: BrandKit[];
  /** Saves the given theme under a name. */
  save: (name: string, theme: Theme) => void;
  /** Removes a brand kit by id. */
  remove: (id: string) => void;
}

/**
 * Zustand store of brand kits (saved themes), persisted to localStorage so they
 * survive across sessions and templates for the anonymous visitor.
 */
export const useBrandKitsStore = create<BrandKitsState>((set) => ({
  kits: load(),
  save: (name, theme) =>
    set((state) => {
      const kits = [...state.kits, { id: generateId(), name, theme }];
      persist(kits);
      return { kits };
    }),
  remove: (id) =>
    set((state) => {
      const kits = state.kits.filter((kit) => kit.id !== id);
      persist(kits);
      return { kits };
    }),
}));
