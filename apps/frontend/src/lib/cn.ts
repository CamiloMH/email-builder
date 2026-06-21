import clsx, { type ClassValue } from 'clsx';

/**
 * Joins conditional class names into a single string.
 *
 * @param inputs - Class values (strings, arrays, conditionals).
 * @returns The combined class name.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
