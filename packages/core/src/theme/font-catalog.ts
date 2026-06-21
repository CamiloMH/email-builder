/**
 * Stylesheet URL for the Inter web font (Google Fonts), embedded in exported
 * emails so the default typography renders on clients that support web fonts.
 */
export const INTER_FONT_URL =
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap';

/** An embeddable web font (loaded via an `@import` in the email `<head>`). */
export interface WebFont {
  /** Human-readable font name. */
  readonly name: string;
  /** Stylesheet URL to `@import`. */
  readonly url: string;
}

/**
 * Web fonts keyed by the theme `fontFamily` stack that selects them. Only fonts
 * that need embedding appear here; web-safe stacks (Helvetica, Georgia, Courier)
 * are intentionally absent.
 */
export const WEB_FONTS: Readonly<Record<string, WebFont>> = {
  "'Inter', system-ui, sans-serif": { name: 'Inter', url: INTER_FONT_URL },
};

/**
 * Returns the embeddable web font for a theme `fontFamily` stack, or `undefined`
 * when the stack is web-safe and needs no embedding. Used by the editor to set
 * `theme.typography.fontUrl` and by the render engine to emit the `@import`.
 *
 * @param fontFamily - The theme `fontFamily` stack value.
 * @returns The matching web font, or `undefined`.
 */
export function webFontFor(fontFamily: string): WebFont | undefined {
  return WEB_FONTS[fontFamily];
}
