import { describe, expect, it } from 'vitest';
import { DEFAULT_THEME } from '../theme/theme.schema';
import { ContrastPair, auditThemeContrast, contrastRatio, relativeLuminance } from './contrast';

describe('relativeLuminance', () => {
  it('is 0 for black and ~1 for white', () => {
    expect(relativeLuminance('#000000')).toBe(0);
    expect(relativeLuminance('#FFFFFF')).toBeCloseTo(1, 5);
  });
});

describe('contrastRatio', () => {
  it('is 21 for black on white and 1 for identical colors', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBe(21);
    expect(contrastRatio('#123456', '#123456')).toBe(1);
  });

  it('is symmetric', () => {
    expect(contrastRatio('#2563EB', '#FFFFFF')).toBe(contrastRatio('#FFFFFF', '#2563EB'));
  });
});

describe('auditThemeContrast', () => {
  it('passes for the default theme readable pairs', () => {
    const results = auditThemeContrast(DEFAULT_THEME);
    const textOnBg = results.find((r) => r.pair === ContrastPair.TextOnBackground);
    expect(textOnBg?.passes).toBe(true);
    expect(results).toHaveLength(4);
  });

  it('flags a low-contrast palette', () => {
    const lowContrast = {
      ...DEFAULT_THEME,
      colors: { ...DEFAULT_THEME.colors, text: '#EEEEEE', background: '#FFFFFF' },
    };
    const result = auditThemeContrast(lowContrast).find(
      (r) => r.pair === ContrastPair.TextOnBackground,
    );
    expect(result?.passes).toBe(false);
  });
});
