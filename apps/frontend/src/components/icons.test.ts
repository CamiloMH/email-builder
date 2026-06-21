import { describe, expect, it } from 'vitest';
import { blockIcon } from './icons';

describe('blockIcon', () => {
  it('returns a component for a known icon name', () => {
    expect(blockIcon('panel-top')).toBeTypeOf('object');
  });

  it('falls back to a default for unknown names', () => {
    expect(blockIcon('does-not-exist')).toBeDefined();
  });
});
