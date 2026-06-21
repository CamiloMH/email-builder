import { type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';

/**
 * Clamps a width to the `[min, max]` range.
 *
 * @param value - The desired width.
 * @param min - Minimum allowed width.
 * @param max - Maximum allowed width.
 * @returns The clamped width.
 */
export function clampWidth(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

interface ResizeHandleProps {
  /** Current width (px) of the panel being resized. */
  width: number;
  /** Minimum allowed width (px). */
  min: number;
  /** Maximum allowed width (px). */
  max: number;
  /** Called with the new (clamped) width as the handle is dragged. */
  onChange: (width: number) => void;
}

/**
 * A vertical drag handle for resizing the panel to its right. Dragging left
 * widens it (and shrinks the area to its left). Desktop only.
 */
export const ResizeHandle = ({ width, min, max, onChange }: ResizeHandleProps): ReactNode => {
  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = width;

    const handleMove = (moveEvent: PointerEvent): void => {
      onChange(clampWidth(startWidth + (startX - moveEvent.clientX), min, max));
    };
    const handleUp = (): void => {
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerup', handleUp);
    };

    document.addEventListener('pointermove', handleMove);
    document.addEventListener('pointerup', handleUp);
  };

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Redimensionar vista previa"
      onPointerDown={handlePointerDown}
      className="hidden w-1.5 shrink-0 cursor-col-resize bg-gray-200 transition-colors hover:bg-brand-400 lg:block"
    />
  );
};
