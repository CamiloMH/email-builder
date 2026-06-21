import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ResizeHandle, clampWidth } from './ResizeHandle';

describe('clampWidth', () => {
  it('clamps to the bounds', () => {
    expect(clampWidth(450, 300, 800)).toBe(450);
    expect(clampWidth(100, 300, 800)).toBe(300);
    expect(clampWidth(2000, 300, 800)).toBe(800);
  });
});

describe('ResizeHandle', () => {
  it('reports a width within bounds while dragging and stops after release', () => {
    const onChange = vi.fn();
    render(<ResizeHandle width={400} min={300} max={800} onChange={onChange} />);
    const handle = screen.getByRole('separator', { name: 'Redimensionar vista previa' });

    // Dragging notifies the parent...
    fireEvent.pointerDown(handle, { clientX: 500 });
    fireEvent.pointerMove(document, { clientX: 450 });
    expect(onChange).toHaveBeenCalled();

    // ...and stops once the pointer is released.
    fireEvent.pointerUp(document);
    onChange.mockClear();
    fireEvent.pointerMove(document, { clientX: 600 });
    expect(onChange).not.toHaveBeenCalled();
  });
});
