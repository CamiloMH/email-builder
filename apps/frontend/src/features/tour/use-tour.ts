import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { runTour, type TourStep } from './tour';

/**
 * Provides a guided tour for a screen: returns a `start` function (wired to a
 * help button) and auto-runs the tour once per visitor (tracked in
 * localStorage). Disabled under tests to avoid driver.js touching layout.
 *
 * @param storageKey - localStorage key marking the tour as seen.
 * @param steps - The tour steps.
 * @returns A function that starts the tour on demand.
 */
export function useTour(storageKey: string, steps: readonly TourStep[]): () => void {
  const { t } = useTranslation();
  const start = useCallback(() => runTour(steps, t), [steps, t]);

  useEffect(() => {
    if (import.meta.env.MODE === 'test') {
      return;
    }
    let cancelled = false;
    try {
      if (!localStorage.getItem(storageKey)) {
        localStorage.setItem(storageKey, '1');
        const id = window.setTimeout(() => {
          if (!cancelled) {
            start();
          }
        }, 700);
        return () => {
          cancelled = true;
          window.clearTimeout(id);
        };
      }
    } catch {
      // Ignore storage errors.
    }
    return undefined;
  }, [storageKey, start]);

  return start;
}
