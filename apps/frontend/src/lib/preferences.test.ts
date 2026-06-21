import { afterEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_EDITOR_PREFERENCES,
  EDITOR_PREFERENCES_KEY,
  loadPreferences,
  savePreferences,
} from './preferences';

describe('editor preferences', () => {
  afterEach(() => localStorage.clear());

  it('returns the defaults when nothing is stored', () => {
    expect(loadPreferences()).toEqual(DEFAULT_EDITOR_PREFERENCES);
  });

  it('persists and reloads preferences', () => {
    savePreferences({ ...DEFAULT_EDITOR_PREFERENCES, previewWidth: 375, paletteCollapsed: true });
    const prefs = loadPreferences();
    expect(prefs.previewWidth).toBe(375);
    expect(prefs.paletteCollapsed).toBe(true);
  });

  it('merges a stored partial over the defaults', () => {
    localStorage.setItem(EDITOR_PREFERENCES_KEY, JSON.stringify({ previewWidth: 500 }));
    const prefs = loadPreferences();
    expect(prefs.previewWidth).toBe(500);
    expect(prefs.previewPaneWidth).toBe(DEFAULT_EDITOR_PREFERENCES.previewPaneWidth);
  });

  it('falls back to defaults on invalid JSON', () => {
    localStorage.setItem(EDITOR_PREFERENCES_KEY, 'not-json');
    expect(loadPreferences()).toEqual(DEFAULT_EDITOR_PREFERENCES);
  });
});
