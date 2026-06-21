import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

/** A single tab descriptor. */
export interface TabItem {
  /** Stable tab id. */
  id: string;
  /** Tab label. */
  label: string;
}

interface TabsProps {
  /** The available tabs. */
  items: readonly TabItem[];
  /** The active tab id. */
  active: string;
  /** Change handler. */
  onChange: (id: string) => void;
}

/**
 * A simple controlled tab bar.
 *
 */
export const Tabs = ({ items, active, onChange }: TabsProps): ReactNode => (
  <div className="flex border-b border-gray-200" role="tablist">
    {items.map((item) => (
      <button
        key={item.id}
        type="button"
        role="tab"
        aria-selected={active === item.id}
        onClick={() => onChange(item.id)}
        className={cn(
          'flex-1 px-3 py-2 text-sm font-medium transition',
          active === item.id
            ? 'border-b-2 border-brand-500 text-brand-600'
            : 'text-gray-500 hover:text-gray-800',
        )}
      >
        {item.label}
      </button>
    ))}
  </div>
);
