import { create } from 'zustand';

/**
 * Tracks image URLs that failed to load, so the live preview can skip them and
 * the inspector can flag them. Populated by the image URL fields.
 */
export interface ImageErrorsState {
  /** URLs known to be broken. */
  broken: ReadonlySet<string>;
  /** Marks a URL as broken. */
  markBroken: (url: string) => void;
  /** Clears the broken flag for a URL (it loaded fine). */
  markValid: (url: string) => void;
}

/**
 * Zustand store of broken image URLs (a new Set is created on each change so
 * subscribers re-render).
 */
export const useImageErrorsStore = create<ImageErrorsState>((set) => ({
  broken: new Set<string>(),
  markBroken: (url) =>
    set((state) => (state.broken.has(url) ? {} : { broken: new Set(state.broken).add(url) })),
  markValid: (url) =>
    set((state) => {
      if (!state.broken.has(url)) {
        return {};
      }
      const broken = new Set(state.broken);
      broken.delete(url);
      return { broken };
    }),
}));
