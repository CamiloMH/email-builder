import { DEFAULT_THEME } from '@email/core';
import { describe, expect, it } from 'vitest';
import { EMAIL_CONTAINER_CLASS, headStyleCss } from './head-style';

describe('headStyleCss', () => {
  it('emits the web-font @import for the default theme', () => {
    const css = headStyleCss(DEFAULT_THEME);
    expect(css).toContain("@import url('https://fonts.googleapis.com/css2?family=Inter");
  });

  it('emits a dark-mode media query when a dark palette is set', () => {
    const css = headStyleCss({
      ...DEFAULT_THEME,
      darkMode: { background: '#111111', text: '#EEEEEE' },
    });
    expect(css).toContain('@media (prefers-color-scheme: dark)');
    expect(css).toContain('background-color:#111111 !important');
    expect(css).toContain(`.${EMAIL_CONTAINER_CLASS}`);
    // surface falls back to the light value when not provided.
    expect(css).toContain(`background-color:${DEFAULT_THEME.colors.surface} !important`);
  });

  it('returns null when there is no web font nor dark palette', () => {
    const plain = {
      ...DEFAULT_THEME,
      typography: { fontFamily: 'Georgia, serif', baseFontSize: 16 },
    };
    expect(headStyleCss(plain)).toBeNull();
  });
});
