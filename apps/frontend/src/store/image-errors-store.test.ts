import { beforeEach, describe, expect, it } from 'vitest';
import { useImageErrorsStore } from './image-errors-store';

const store = () => useImageErrorsStore.getState();

beforeEach(() => useImageErrorsStore.setState({ broken: new Set() }));

describe('image errors store', () => {
  it('marks a url as broken and clears it', () => {
    store().markBroken('https://x/a.png');
    expect(store().broken.has('https://x/a.png')).toBe(true);

    store().markValid('https://x/a.png');
    expect(store().broken.has('https://x/a.png')).toBe(false);
  });

  it('is a no-op when marking an already-tracked or untracked url', () => {
    store().markBroken('a');
    const first = store().broken;
    store().markBroken('a');
    expect(store().broken).toBe(first);
    store().markValid('missing');
    expect(store().broken).toBe(first);
  });
});
