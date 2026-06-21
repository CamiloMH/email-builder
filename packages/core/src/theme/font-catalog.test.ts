import { describe, expect, it } from 'vitest';
import { DEFAULT_THEME } from './theme.schema';
import { INTER_FONT_URL, webFontFor } from './font-catalog';

describe('webFontFor', () => {
  it('returns the Inter web font for the Inter stack', () => {
    const font = webFontFor(DEFAULT_THEME.typography.fontFamily);
    expect(font).toEqual({ name: 'Inter', url: INTER_FONT_URL });
  });

  it('returns undefined for web-safe stacks', () => {
    expect(webFontFor("Georgia, 'Times New Roman', serif")).toBeUndefined();
    expect(webFontFor("'Courier New', monospace")).toBeUndefined();
  });
});
