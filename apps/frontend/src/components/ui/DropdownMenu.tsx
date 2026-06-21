import { useRef, useState, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { useDismiss } from '../../lib/use-dismiss';
import { Button, ButtonVariant } from './controls';

/** A single action in a {@link DropdownMenu}. */
export interface DropdownMenuItem {
  /** Stable identifier (also used as the React key). */
  id: string;
  /** Visible label. */
  label: string;
  /** Optional leading icon. */
  icon?: ReactNode;
  /** Invoked when the item is chosen. */
  onSelect: () => void;
}

interface DropdownMenuProps {
  /** Accessible label for the trigger button. */
  ariaLabel: string;
  /** Trigger button content. */
  trigger: ReactNode;
  /** Visual variant of the trigger button. */
  variant?: ButtonVariant;
  /** The menu actions. */
  items: DropdownMenuItem[];
  /** Horizontal alignment of the menu relative to the trigger. */
  align?: 'left' | 'right';
}

/**
 * A button that toggles a popup menu of actions. Closes after a selection, on
 * outside click or on Escape (via {@link useDismiss}). Used to collapse the
 * several export options behind a single "Exportar" control.
 */
export const DropdownMenu = ({
  ariaLabel,
  trigger,
  variant = ButtonVariant.Secondary,
  items,
  align = 'right',
}: DropdownMenuProps): ReactNode => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useDismiss(open, containerRef, () => setOpen(false));

  const select = (item: DropdownMenuItem): void => {
    setOpen(false);
    item.onSelect();
  };

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant={variant}
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((previous) => !previous)}
      >
        {trigger}
      </Button>

      {open ? (
        <div
          role="menu"
          aria-label={ariaLabel}
          className={cn(
            'absolute z-20 mt-1 w-56 overflow-hidden rounded-lg border border-gray-200 bg-white p-1 shadow-lg',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              onClick={() => select(item)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-gray-700 transition hover:bg-gray-100"
            >
              {item.icon ? (
                <span className="shrink-0 text-gray-400" aria-hidden>
                  {item.icon}
                </span>
              ) : null}
              <span className="flex-1 truncate">{item.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};
