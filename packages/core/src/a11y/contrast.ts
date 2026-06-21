import type { Theme } from '../theme/theme.schema';

/** Minimum WCAG AA contrast ratio for normal-size text. */
export const WCAG_AA_NORMAL = 4.5;

/** Theme color pairs whose contrast matters for readability. */
export const ContrastPair = {
  TextOnBackground: 'textOnBackground',
  TextOnSurface: 'textOnSurface',
  ButtonLabelOnPrimary: 'buttonLabelOnPrimary',
  MutedOnSurface: 'mutedOnSurface',
} as const;

/** A theme contrast pair identifier. */
export type ContrastPair = (typeof ContrastPair)[keyof typeof ContrastPair];

/** The result of auditing a single color pair. */
export interface ContrastResult {
  /** Which pair was measured. */
  pair: ContrastPair;
  /** The contrast ratio, rounded to two decimals (1–21). */
  ratio: number;
  /** Whether the ratio meets WCAG AA for normal text. */
  passes: boolean;
}

// Converts an sRGB channel (0-255) to its linear value.
function linearize(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/**
 * Computes the WCAG relative luminance of a 6-digit hex color.
 *
 * @param hex - A `#RRGGBB` color.
 * @returns The relative luminance (0–1).
 */
export function relativeLuminance(hex: string): number {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/**
 * Computes the WCAG contrast ratio between two hex colors.
 *
 * @param hexA - The first `#RRGGBB` color.
 * @param hexB - The second `#RRGGBB` color.
 * @returns The contrast ratio, from 1 (identical) to 21 (black on white).
 */
export function contrastRatio(hexA: string, hexB: string): number {
  const a = relativeLuminance(hexA);
  const b = relativeLuminance(hexB);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100;
}

/**
 * Audits the readability-critical color pairs of a theme against WCAG AA.
 *
 * @param theme - The theme to audit.
 * @returns One {@link ContrastResult} per measured pair.
 */
export function auditThemeContrast(theme: Theme): ContrastResult[] {
  const { colors } = theme;
  const pairs: ReadonlyArray<readonly [ContrastPair, string, string]> = [
    [ContrastPair.TextOnBackground, colors.text, colors.background],
    [ContrastPair.TextOnSurface, colors.text, colors.surface],
    [ContrastPair.ButtonLabelOnPrimary, colors.surface, colors.primary],
    [ContrastPair.MutedOnSurface, colors.muted, colors.surface],
  ];
  return pairs.map(([pair, a, b]) => {
    const ratio = contrastRatio(a, b);
    return { pair, ratio, passes: ratio >= WCAG_AA_NORMAL };
  });
}
