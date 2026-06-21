import { Align, ButtonVariant, type Theme } from '@email/core';
import type { CSSProperties } from 'react';

/**
 * Builds an email-safe alignment style for a block-level image (e.g. a logo)
 * using `display:block` + auto margins, which works across email clients where
 * `text-align` on a wrapper does not.
 *
 * @param align - The desired horizontal alignment.
 * @returns The CSS for the image.
 */
export function imageAlignStyle(align: Align): CSSProperties {
  return {
    display: 'block',
    marginLeft: align === Align.Left ? 0 : 'auto',
    marginRight: align === Align.Right ? 0 : 'auto',
  };
}

/**
 * Builds the `<Body>` style from the theme (page background and base typography).
 *
 * @param theme - The email theme.
 * @returns The CSS properties for the email body.
 */
export function bodyStyle(theme: Theme): CSSProperties {
  return {
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.baseFontSize,
    margin: 0,
    padding: theme.layout.spacing,
  };
}

/**
 * Builds the centered content `<Container>` style from the theme.
 *
 * @param theme - The email theme.
 * @returns The CSS properties for the content container.
 */
export function containerStyle(theme: Theme): CSSProperties {
  return {
    backgroundColor: theme.colors.surface,
    maxWidth: theme.layout.contentWidth,
    width: '100%',
    margin: '0 auto',
    borderRadius: theme.layout.borderRadius,
    overflow: 'hidden',
  };
}

/**
 * Builds a per-block `<Section>` style with consistent padding, optionally
 * merging extra properties (e.g. text alignment).
 *
 * @param theme - The email theme.
 * @param extra - Additional CSS properties to merge in.
 * @returns The CSS properties for a block section.
 */
export function sectionStyle(theme: Theme, extra: CSSProperties = {}): CSSProperties {
  return {
    paddingLeft: theme.layout.spacing,
    paddingRight: theme.layout.spacing,
    paddingTop: theme.layout.spacing / 2,
    paddingBottom: theme.layout.spacing / 2,
    ...extra,
  };
}

/**
 * Builds the call-to-action `<Button>` style from the theme and options.
 *
 * @param theme - The email theme.
 * @param variant - `filled` (default) or `outline`.
 * @param fullWidth - Whether the button spans the full width.
 * @returns The CSS properties for the button.
 */
export function buttonStyle(
  theme: Theme,
  variant: ButtonVariant = ButtonVariant.Filled,
  fullWidth = false,
): CSSProperties {
  const outlined = variant === ButtonVariant.Outline;
  return {
    backgroundColor: outlined ? 'transparent' : theme.colors.primary,
    color: outlined ? theme.colors.primary : theme.colors.surface,
    border: outlined ? `1px solid ${theme.colors.primary}` : 'none',
    borderRadius: theme.layout.borderRadius,
    padding: '12px 24px',
    fontWeight: 600,
    textDecoration: 'none',
    display: fullWidth ? 'block' : 'inline-block',
    width: fullWidth ? '100%' : undefined,
    textAlign: 'center',
    boxSizing: 'border-box',
  };
}
