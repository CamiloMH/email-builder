import { describe, expect, it } from 'vitest';
import { Align, DEFAULT_THEME } from '@email/core';
import {
  bodyStyle,
  buttonStyle,
  containerStyle,
  imageAlignStyle,
  sectionStyle,
} from './theme-style';

describe('theme-style', () => {
  it('bodyStyle uses the background color and typography', () => {
    const style = bodyStyle(DEFAULT_THEME);
    expect(style.backgroundColor).toBe(DEFAULT_THEME.colors.background);
    expect(style.fontFamily).toBe(DEFAULT_THEME.typography.fontFamily);
    expect(style.fontSize).toBe(DEFAULT_THEME.typography.baseFontSize);
  });

  it('containerStyle centers content and uses the surface color', () => {
    const style = containerStyle(DEFAULT_THEME);
    expect(style.backgroundColor).toBe(DEFAULT_THEME.colors.surface);
    expect(style.maxWidth).toBe(DEFAULT_THEME.layout.contentWidth);
    expect(style.margin).toBe('0 auto');
  });

  it('sectionStyle merges extra properties over the base padding', () => {
    const style = sectionStyle(DEFAULT_THEME, { textAlign: Align.Center });
    expect(style.textAlign).toBe(Align.Center);
    expect(style.paddingLeft).toBe(DEFAULT_THEME.layout.spacing);
  });

  it('buttonStyle uses the primary color and surface text color', () => {
    const style = buttonStyle(DEFAULT_THEME);
    expect(style.backgroundColor).toBe(DEFAULT_THEME.colors.primary);
    expect(style.color).toBe(DEFAULT_THEME.colors.surface);
  });

  it('imageAlignStyle aligns a block image with auto margins', () => {
    expect(imageAlignStyle(Align.Left)).toMatchObject({ display: 'block', marginLeft: 0, marginRight: 'auto' });
    expect(imageAlignStyle(Align.Center)).toMatchObject({ marginLeft: 'auto', marginRight: 'auto' });
    expect(imageAlignStyle(Align.Right)).toMatchObject({ marginLeft: 'auto', marginRight: 0 });
  });
});
