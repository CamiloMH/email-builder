import { useEffect, type RefObject } from 'react';

/**
 * Dismisses an open popup when the user clicks outside the referenced element
 * or presses Escape. Shared by the template switcher and the export menu so the
 * close-on-outside/Escape behaviour lives in one place. No-op while `open` is
 * false.
 *
 * @param open - Whether the popup is currently open.
 * @param ref - Ref to the popup's root element (clicks inside are ignored).
 * @param onDismiss - Called when the popup should close.
 */
export function useDismiss(
  open: boolean,
  ref: RefObject<HTMLElement | null>,
  onDismiss: () => void,
): void {
  useEffect(() => {
    if (!open) {
      return;
    }
    const handlePointer = (event: MouseEvent): void => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onDismiss();
      }
    };
    const handleKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onDismiss();
      }
    };
    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open, ref, onDismiss]);
}
