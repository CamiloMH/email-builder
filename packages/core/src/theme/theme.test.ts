import { describe, expect, it } from 'vitest';
import { DEFAULT_THEME, themeSchema } from './theme.schema';

describe('themeSchema', () => {
  it('accepts the default theme', () => {
    expect(() => themeSchema.parse(DEFAULT_THEME)).not.toThrow();
  });

  it('rejects an invalid hex color in the palette', () => {
    const broken = {
      ...DEFAULT_THEME,
      colors: { ...DEFAULT_THEME.colors, primary: 'blue' },
    };
    expect(themeSchema.safeParse(broken).success).toBe(false);
  });

  it('rejects a content width outside the allowed range', () => {
    const broken = {
      ...DEFAULT_THEME,
      layout: { ...DEFAULT_THEME.layout, contentWidth: 1200 },
    };
    expect(themeSchema.safeParse(broken).success).toBe(false);
  });

  it('rejects a non-integer base font size', () => {
    const broken = {
      ...DEFAULT_THEME,
      typography: { ...DEFAULT_THEME.typography, baseFontSize: 16.5 },
    };
    expect(themeSchema.safeParse(broken).success).toBe(false);
  });
});
