import { describe, expect, it } from 'vitest';
import { arrayMove } from './array-move';

describe('arrayMove', () => {
  it('moves an item forward', () => {
    expect(arrayMove(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a']);
  });

  it('moves an item backward', () => {
    expect(arrayMove(['a', 'b', 'c'], 2, 0)).toEqual(['c', 'a', 'b']);
  });

  it('does not mutate the input', () => {
    const input = ['a', 'b', 'c'];
    arrayMove(input, 0, 1);
    expect(input).toEqual(['a', 'b', 'c']);
  });

  it('returns a copy when indices are out of range', () => {
    expect(arrayMove(['a', 'b'], -1, 0)).toEqual(['a', 'b']);
    expect(arrayMove(['a', 'b'], 0, 5)).toEqual(['a', 'b']);
  });
});
