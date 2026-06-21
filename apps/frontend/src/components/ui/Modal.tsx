import { X } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';

interface ModalProps {
  /** Whether the modal is open. */
  open: boolean;
  /** Accessible title shown in the header. */
  title: string;
  /** Close handler (backdrop click, close button or Escape). */
  onClose: () => void;
  /** Modal body. */
  children: ReactNode;
}

/**
 * Accessible modal dialog: traps focus by moving it into the dialog, closes on
 * Escape or backdrop click, and exposes `role="dialog"` + `aria-modal`.
 */
export const Modal = ({ open, title, onClose, children }: ModalProps): ReactNode => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    dialogRef.current?.focus();
    const handleKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[85vh] w-[min(92vw,720px)] flex-col rounded-xl bg-white shadow-xl outline-none"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 className="font-semibold text-gray-900">{title}</h2>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <X size={18} aria-hidden />
          </button>
        </div>
        <div className="overflow-auto">{children}</div>
      </div>
    </div>
  );
};
