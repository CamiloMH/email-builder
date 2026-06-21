import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { HexColorPicker } from 'react-colorful';

interface ColorFieldProps {
  /** Field label. */
  label: string;
  /** Current hex color. */
  value: string;
  /** Change handler receiving the new hex color. */
  onChange: (value: string) => void;
}

/**
 * A color swatch that opens a popover hex color picker.
 *
 */
export const ColorField = ({ label, value, onChange }: ColorFieldProps): ReactNode => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative flex items-center justify-between gap-2 text-sm">
      <span className="font-medium text-gray-600">{label}</span>
      <button
        type="button"
        aria-label={t('theme.changeColor', { label })}
        onClick={() => setOpen((previous) => !previous)}
        className="h-7 w-12 rounded border border-gray-300"
        style={{ backgroundColor: value }}
      />
      {open ? (
        <div className="absolute right-0 top-9 z-20 rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
          <HexColorPicker color={value} onChange={onChange} />
          <input
            aria-label={t('theme.hex', { label })}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="mt-2 w-full rounded border border-gray-300 px-2 py-1 text-xs"
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-2 w-full rounded bg-gray-100 px-2 py-1 text-xs font-medium"
          >
            {t('common.close')}
          </button>
        </div>
      ) : null}
    </div>
  );
};
