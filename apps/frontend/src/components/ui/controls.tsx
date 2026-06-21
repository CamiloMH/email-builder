import { Align } from '@email/core';
import { Loader2 } from 'lucide-react';
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { cn } from '../../lib/cn';

/** Visual variants for {@link Button}. */
export const ButtonVariant = {
  Primary: 'primary',
  Secondary: 'secondary',
  Ghost: 'ghost',
  Danger: 'danger',
} as const;

/** A {@link Button} visual variant. */
export type ButtonVariant = (typeof ButtonVariant)[keyof typeof ButtonVariant];

const BUTTON_VARIANT_CLASSES: Record<ButtonVariant, string> = {
  [ButtonVariant.Primary]: 'bg-brand-500 text-white hover:bg-brand-600',
  [ButtonVariant.Secondary]: 'border border-gray-300 bg-white text-gray-800 hover:bg-gray-50',
  [ButtonVariant.Ghost]: 'text-gray-600 hover:bg-gray-100',
  [ButtonVariant.Danger]: 'bg-red-600 text-white hover:bg-red-700',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant. */
  variant?: ButtonVariant;
  /**
   * When `true` the button shows a spinner, becomes disabled and exposes
   * `aria-busy` so assistive tech announces the in-progress state.
   */
  loading?: boolean;
}

/**
 * A styled button. While {@link ButtonProps.loading} is set it renders a leading
 * spinner and blocks interaction, giving feedback during async actions.
 */
export const Button = ({
  variant = ButtonVariant.Primary,
  className,
  type = 'button',
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps): ReactNode => (
  <button
    type={type}
    disabled={disabled || loading}
    aria-busy={loading || undefined}
    className={cn(
      'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50',
      BUTTON_VARIANT_CLASSES[variant],
      className,
    )}
    {...props}
  >
    {loading ? <Loader2 size={16} className="animate-spin" aria-hidden /> : null}
    {children}
  </button>
);

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible label. */
  label: string;
}

/**
 * A square, icon-only button.
 *
 */
export const IconButton = ({
  label,
  className,
  type = 'button',
  ...props
}: IconButtonProps): ReactNode => (
  <button
    type={type}
    aria-label={label}
    title={label}
    className={cn(
      'inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 hover:text-gray-900',
      className,
    )}
    {...props}
  />
);

interface FieldProps {
  /** Field label. */
  label: string;
  /** Field control(s). */
  children: ReactNode;
}

/**
 * Labelled form field wrapper.
 *
 */
export const Field = ({ label, children }: FieldProps): ReactNode => (
  <label className="flex flex-col gap-1 text-sm">
    <span className="font-medium text-gray-600">{label}</span>
    {children}
  </label>
);

/**
 * A text input.
 *
 */
export const TextInput = ({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>): ReactNode => (
  <input
    className={cn(
      'rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500',
      className,
    )}
    {...props}
  />
);

/**
 * A multi-line text input.
 *
 */
export const TextArea = ({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>): ReactNode => (
  <textarea
    className={cn(
      'min-h-20 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500',
      className,
    )}
    {...props}
  />
);

/**
 * A native select.
 *
 */
export const Select = ({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>): ReactNode => (
  <select
    className={cn(
      'rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500',
      className,
    )}
    {...props}
  >
    {children}
  </select>
);

interface RangeSliderProps {
  /** Current value. */
  value: number;
  /** Minimum value. */
  min: number;
  /** Maximum value. */
  max: number;
  /** Step increment. */
  step?: number;
  /** Change handler receiving the new numeric value. */
  onChange: (value: number) => void;
}

/**
 * A numeric range slider.
 *
 */
export const RangeSlider = ({
  value,
  min,
  max,
  step = 1,
  onChange,
}: RangeSliderProps): ReactNode => (
  <input
    type="range"
    value={value}
    min={min}
    max={max}
    step={step}
    onChange={(event) => onChange(Number(event.target.value))}
    className="w-full accent-brand-500"
  />
);

interface SegmentedControlProps {
  /** The selected alignment. */
  value: Align;
  /** Change handler. */
  onChange: (value: Align) => void;
}

const ALIGN_OPTIONS: ReadonlyArray<{ value: Align; label: string }> = [
  { value: Align.Left, label: 'Izquierda' },
  { value: Align.Center, label: 'Centro' },
  { value: Align.Right, label: 'Derecha' },
];

/**
 * A three-way alignment toggle.
 *
 */
export const SegmentedControl = ({ value, onChange }: SegmentedControlProps): ReactNode => (
  <div className="inline-flex rounded-md border border-gray-300 p-0.5">
    {ALIGN_OPTIONS.map((option) => (
      <button
        key={option.value}
        type="button"
        aria-pressed={value === option.value}
        onClick={() => onChange(option.value)}
        className={cn(
          'rounded px-3 py-1 text-xs font-medium transition',
          value === option.value ? 'bg-brand-500 text-white' : 'text-gray-600 hover:bg-gray-100',
        )}
      >
        {option.label}
      </button>
    ))}
  </div>
);

interface CheckboxProps {
  /** Checkbox label. */
  label: string;
  /** Whether it is checked. */
  checked: boolean;
  /** Change handler. */
  onChange: (checked: boolean) => void;
}

/** A labelled checkbox toggle. */
export const Checkbox = ({ label, checked, onChange }: CheckboxProps): ReactNode => (
  <label className="flex items-center gap-2 text-sm text-gray-700">
    <input
      type="checkbox"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      className="h-4 w-4 accent-brand-500"
    />
    {label}
  </label>
);
