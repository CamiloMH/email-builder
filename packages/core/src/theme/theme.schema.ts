import { z } from 'zod';
import { hexColorSchema } from '../common/color.schema';
import { INTER_FONT_URL } from './font-catalog';

/**
 * Visual theme applied to the whole email: color palette, typography and
 * layout. Stored alongside the blocks and consumed by the render engine.
 */
export const themeSchema = z.object({
  colors: z.object({
    primary: hexColorSchema,
    secondary: hexColorSchema,
    background: hexColorSchema,
    surface: hexColorSchema,
    text: hexColorSchema,
    muted: hexColorSchema,
  }),
  typography: z.object({
    fontFamily: z.string().min(1),
    baseFontSize: z.number().int().min(10).max(24),
    /**
     * Optional stylesheet URL embedded (via `@import`) so a web font like Inter
     * renders in clients that support web fonts. Web-safe stacks omit it.
     */
    fontUrl: z.string().url().optional(),
  }),
  layout: z.object({
    contentWidth: z.number().int().min(320).max(800),
    spacing: z.number().int().min(0).max(64),
    borderRadius: z.number().int().min(0).max(32),
  }),
  /**
   * Optional dark-mode palette. When present, the render engine emits a
   * `@media (prefers-color-scheme: dark)` block overriding the page background,
   * surface and text. Each value falls back to its light counterpart.
   */
  darkMode: z
    .object({
      background: hexColorSchema,
      surface: hexColorSchema,
      text: hexColorSchema,
    })
    .partial()
    .optional(),
});

/**
 * A validated email theme.
 */
export type Theme = z.infer<typeof themeSchema>;

/**
 * The default theme used when creating a new template. Guaranteed to satisfy
 * {@link themeSchema}.
 */
export const DEFAULT_THEME: Theme = {
  colors: {
    primary: '#2563EB',
    secondary: '#7C3AED',
    background: '#F3F4F6',
    surface: '#FFFFFF',
    text: '#111827',
    muted: '#6B7280',
  },
  typography: {
    fontFamily: "'Inter', system-ui, sans-serif",
    baseFontSize: 16,
    fontUrl: INTER_FONT_URL,
  },
  layout: {
    contentWidth: 600,
    spacing: 24,
    borderRadius: 8,
  },
};
