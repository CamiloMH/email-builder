import { z } from 'zod';

/**
 * Matches a 6-digit hexadecimal color (e.g. `#1A2B3C`). Shorthand (`#abc`) and
 * alpha channels are intentionally rejected to keep email-client compatibility.
 */
export const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

/**
 * Zod schema for a 6-digit hex color string. Reused across the theme palette.
 */
export const hexColorSchema = z
  .string()
  .regex(HEX_COLOR_PATTERN, 'Must be a 6-digit hex color, e.g. #1A2B3C');

/**
 * A validated 6-digit hex color string.
 */
export type HexColor = z.infer<typeof hexColorSchema>;

/**
 * Horizontal alignment values shared by several block kinds. Enum-like `const`
 * so call sites reference `Align.Center` instead of a bare string literal.
 */
export const Align = {
  Left: 'left',
  Center: 'center',
  Right: 'right',
} as const;

/**
 * Horizontal alignment value (`left`, `center` or `right`).
 */
export type Align = (typeof Align)[keyof typeof Align];

/**
 * Zod schema validating a horizontal {@link Align} value.
 */
export const alignSchema = z.nativeEnum(Align);
