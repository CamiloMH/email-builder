import { ContrastPair, auditThemeContrast, webFontFor, type Theme } from '@email/core';
import { Trash2 } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ColorField } from '../../components/ui/ColorField';
import { Button, Checkbox, Field, RangeSlider, Select } from '../../components/ui/controls';
import { useBrandKitsStore } from '../../store/brand-kits-store';
import { useBuilderStore } from '../../store/builder-store';

const FONT_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: "'Inter', system-ui, sans-serif", label: 'Inter' },
  { value: "'Helvetica Neue', Helvetica, Arial, sans-serif", label: 'Helvetica' },
  { value: "Georgia, 'Times New Roman', serif", label: 'Georgia' },
  { value: "'Courier New', monospace", label: 'Courier' },
];

const COLOR_FIELDS: ReadonlyArray<{ key: keyof Theme['colors']; labelKey: string }> = [
  { key: 'primary', labelKey: 'theme.color.primary' },
  { key: 'secondary', labelKey: 'theme.color.secondary' },
  { key: 'background', labelKey: 'theme.color.background' },
  { key: 'surface', labelKey: 'theme.color.surface' },
  { key: 'text', labelKey: 'theme.color.text' },
  { key: 'muted', labelKey: 'theme.color.muted' },
];

/** Color keys involved in each contrast pair, for the warning labels. */
const PAIR_COLORS: Record<ContrastPair, [keyof Theme['colors'], keyof Theme['colors']]> = {
  [ContrastPair.TextOnBackground]: ['text', 'background'],
  [ContrastPair.TextOnSurface]: ['text', 'surface'],
  [ContrastPair.ButtonLabelOnPrimary]: ['surface', 'primary'],
  [ContrastPair.MutedOnSurface]: ['muted', 'surface'],
};

/** Sensible starting palette when dark mode is enabled. */
const DEFAULT_DARK = {
  background: '#0B1220',
  surface: '#111827',
  text: '#F9FAFB',
} as const;

/**
 * Theme editor: brand kits, palette (with contrast warnings), typography (with
 * web-font embedding), layout and an optional email dark-mode palette. Hovering a
 * color highlights the affected elements in the live preview.
 */
export const ThemePanel = (): ReactNode => {
  const { t } = useTranslation();
  const document = useBuilderStore((state) => state.document);
  const updateTheme = useBuilderStore((state) => state.updateTheme);
  const setHighlightColor = useBuilderStore((state) => state.setHighlightColor);
  const kits = useBrandKitsStore((state) => state.kits);
  const saveKit = useBrandKitsStore((state) => state.save);
  const removeKit = useBrandKitsStore((state) => state.remove);
  const [kitName, setKitName] = useState('');

  if (!document) {
    return null;
  }
  const { theme } = document;

  const setColor = (key: keyof Theme['colors'], value: string): void =>
    updateTheme({ ...theme, colors: { ...theme.colors, [key]: value } });

  const setLayout = (key: keyof Theme['layout'], value: number): void =>
    updateTheme({ ...theme, layout: { ...theme.layout, [key]: value } });

  const setFont = (fontFamily: string): void =>
    updateTheme({
      ...theme,
      typography: { ...theme.typography, fontFamily, fontUrl: webFontFor(fontFamily)?.url },
    });

  const setDark = (key: keyof typeof DEFAULT_DARK, value: string): void =>
    updateTheme({ ...theme, darkMode: { ...(theme.darkMode ?? DEFAULT_DARK), [key]: value } });

  const toggleDark = (on: boolean): void =>
    updateTheme({ ...theme, darkMode: on ? (theme.darkMode ?? DEFAULT_DARK) : undefined });

  const failingContrast = auditThemeContrast(theme).filter((result) => !result.passes);

  const handleSaveKit = (): void => {
    const name = kitName.trim();
    if (name) {
      saveKit(name, theme);
      setKitName('');
    }
  };

  return (
    <div className="flex flex-col gap-5 p-4">
      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          {t('theme.brandKits')}
        </h3>
        <div className="flex gap-2">
          <input
            aria-label={t('theme.brandKitName')}
            value={kitName}
            onChange={(event) => setKitName(event.target.value)}
            className="min-w-0 flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm"
          />
          <Button variant="secondary" onClick={handleSaveKit} disabled={!kitName.trim()}>
            {t('theme.saveBrandKit')}
          </Button>
        </div>
        {kits.length === 0 ? (
          <p className="text-xs text-gray-400">{t('theme.noBrandKits')}</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {kits.map((kit) => (
              <li key={kit.id} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => updateTheme(kit.theme)}
                  aria-label={t('theme.applyBrandKit', { name: kit.name })}
                  className="flex flex-1 items-center gap-2 rounded-md border border-gray-200 px-2 py-1 text-left text-sm hover:bg-gray-50"
                >
                  <span
                    className="h-4 w-4 shrink-0 rounded-full border border-gray-300"
                    style={{ backgroundColor: kit.theme.colors.primary }}
                    aria-hidden
                  />
                  <span className="flex-1 truncate">{kit.name}</span>
                </button>
                <button
                  type="button"
                  onClick={() => removeKit(kit.id)}
                  aria-label={t('theme.deleteBrandKit', { name: kit.name })}
                  className="shrink-0 rounded-md p-1.5 text-gray-400 hover:text-red-600"
                >
                  <Trash2 size={14} aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          {t('theme.colors')}
        </h3>
        {COLOR_FIELDS.map((field) => (
          <div
            key={field.key}
            onMouseEnter={() => setHighlightColor(theme.colors[field.key])}
            onMouseLeave={() => setHighlightColor(null)}
          >
            <ColorField
              label={t(field.labelKey)}
              value={theme.colors[field.key]}
              onChange={(value) => setColor(field.key, value)}
            />
          </div>
        ))}
        {failingContrast.length > 0 ? (
          <ul className="mt-1 flex flex-col gap-1">
            {failingContrast.map((result) => {
              const [a, b] = PAIR_COLORS[result.pair];
              return (
                <li
                  key={result.pair}
                  className="rounded border border-yellow-200 bg-yellow-50 px-2 py-1 text-xs text-yellow-800"
                >
                  {t(`theme.color.${a}`)} / {t(`theme.color.${b}`)} —{' '}
                  {t('theme.lowContrast', { ratio: result.ratio })}
                </li>
              );
            })}
          </ul>
        ) : null}
      </section>

      <Field label={t('theme.typography')}>
        <Select
          value={theme.typography.fontFamily}
          onChange={(event) => setFont(event.target.value)}
        >
          {FONT_OPTIONS.map((font) => (
            <option key={font.label} value={font.value}>
              {font.label}
            </option>
          ))}
        </Select>
      </Field>

      <section className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          {t('theme.layout')}
        </h3>
        <Field label={t('theme.contentWidth', { value: theme.layout.contentWidth })}>
          <RangeSlider
            value={theme.layout.contentWidth}
            min={320}
            max={800}
            step={10}
            onChange={(value) => setLayout('contentWidth', value)}
          />
        </Field>
        <Field label={t('theme.spacing', { value: theme.layout.spacing })}>
          <RangeSlider
            value={theme.layout.spacing}
            min={0}
            max={64}
            onChange={(value) => setLayout('spacing', value)}
          />
        </Field>
        <Field label={t('theme.borderRadius', { value: theme.layout.borderRadius })}>
          <RangeSlider
            value={theme.layout.borderRadius}
            min={0}
            max={32}
            onChange={(value) => setLayout('borderRadius', value)}
          />
        </Field>
      </section>

      <section className="flex flex-col gap-2">
        <Checkbox
          label={t('theme.darkMode')}
          checked={Boolean(theme.darkMode)}
          onChange={toggleDark}
        />
        {theme.darkMode ? (
          <>
            <p className="text-xs text-gray-400">{t('theme.darkModeHint')}</p>
            <ColorField
              label={t('theme.darkBackground')}
              value={theme.darkMode.background ?? DEFAULT_DARK.background}
              onChange={(value) => setDark('background', value)}
            />
            <ColorField
              label={t('theme.darkSurface')}
              value={theme.darkMode.surface ?? DEFAULT_DARK.surface}
              onChange={(value) => setDark('surface', value)}
            />
            <ColorField
              label={t('theme.darkText')}
              value={theme.darkMode.text ?? DEFAULT_DARK.text}
              onChange={(value) => setDark('text', value)}
            />
          </>
        ) : null}
      </section>
    </div>
  );
};
