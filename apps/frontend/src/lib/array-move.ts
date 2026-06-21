/**
 * Returns a new array with the item at `from` moved to `to`, leaving the input
 * untouched. Out-of-range indices are clamped/ignored, returning a shallow copy.
 *
 * @typeParam T - The array element type.
 * @param items - The source array.
 * @param from - The index to move from.
 * @param to - The index to move to.
 * @returns A new, reordered array.
 */
export function arrayMove<T>(items: readonly T[], from: number, to: number): T[] {
  const result = [...items];
  if (from < 0 || from >= result.length || to < 0 || to >= result.length) {
    return result;
  }
  const [moved] = result.splice(from, 1);
  if (moved !== undefined) {
    result.splice(to, 0, moved);
  }
  return result;
}
