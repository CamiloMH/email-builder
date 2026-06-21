import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useImageErrorsStore } from '../../store/image-errors-store';
import { ImageUrlField } from './ImageUrlField';

// Minimal Image stub: URLs containing "broken" fail to load, others succeed.
class MockImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  set src(value: string) {
    queueMicrotask(() => {
      if (value.includes('broken')) {
        this.onerror?.();
      } else {
        this.onload?.();
      }
    });
  }
}

beforeEach(() => {
  useImageErrorsStore.setState({ broken: new Set() });
  vi.stubGlobal('Image', MockImage);
});

afterEach(() => vi.unstubAllGlobals());

describe('ImageUrlField', () => {
  it('shows an inline error and records a broken image', async () => {
    render(<ImageUrlField label="Logo" value="https://broken.png" onChange={() => {}} />);
    await waitFor(
      () => expect(screen.getByText(/No se pudo cargar la imagen/)).toBeInTheDocument(),
      { timeout: 2000 },
    );
    expect(useImageErrorsStore.getState().broken.has('https://broken.png')).toBe(true);
  });

  it('clears the broken flag when the image loads', async () => {
    useImageErrorsStore.getState().markBroken('https://good.png');
    render(<ImageUrlField label="Logo" value="https://good.png" onChange={() => {}} />);
    await waitFor(
      () => expect(useImageErrorsStore.getState().broken.has('https://good.png')).toBe(false),
      { timeout: 2000 },
    );
    expect(screen.queryByText(/No se pudo cargar la imagen/)).not.toBeInTheDocument();
  });
});
