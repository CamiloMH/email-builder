import { useEffect, useState } from 'react';

/**
 * Returns a debounced copy of a value that only updates after `delayMs` of
 * inactivity. Used to throttle live-preview re-renders while editing.
 *
 * @typeParam T - The value type.
 * @param value - The source value.
 * @param delayMs - The debounce delay in milliseconds.
 * @returns The debounced value.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
