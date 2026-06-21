import type { Theme } from '@email/core';

/** Class added to the content container so dark-mode CSS can target it. */
export const EMAIL_CONTAINER_CLASS = 'email-container';

/**
 * Builds the CSS injected into the email `<head>` from the theme: an `@import`
 * for the web font (so e.g. Inter renders) followed by a
 * `@media (prefers-color-scheme: dark)` block overriding page background,
 * surface and text. Returns `null` when neither applies.
 *
 * Shared by the render builder and the React-source code generator so the
 * exported component and the rendered HTML stay identical.
 *
 * @param theme - The email theme.
 * @returns The `<style>` CSS, or `null` when nothing needs injecting.
 */
export function headStyleCss(theme: Theme): string | null {
  const parts: string[] = [];

  if (theme.typography.fontUrl) {
    parts.push(`@import url('${theme.typography.fontUrl}');`);
  }

  if (theme.darkMode) {
    const background = theme.darkMode.background ?? theme.colors.background;
    const text = theme.darkMode.text ?? theme.colors.text;
    const surface = theme.darkMode.surface ?? theme.colors.surface;
    parts.push(
      `@media (prefers-color-scheme: dark){` +
        `body{background-color:${background} !important;color:${text} !important;}` +
        `.${EMAIL_CONTAINER_CLASS}{background-color:${surface} !important;}}`,
    );
  }

  return parts.length > 0 ? parts.join('\n') : null;
}
