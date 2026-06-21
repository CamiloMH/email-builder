/** localStorage key for the editor preferences. */
export const EDITOR_PREFERENCES_KEY = 'email-builder-editor-prefs';

/**
 * Persisted editor preferences (kept across sessions and template switches).
 */
export interface EditorPreferences {
  /** Preview device width in pixels (e.g. desktop vs mobile). */
  previewWidth: number;
  /** Resizable preview-pane width in pixels. */
  previewPaneWidth: number;
  /** Whether the palette sidebar is collapsed. */
  paletteCollapsed: boolean;
  /** Whether the inspector sidebar is collapsed. */
  inspectorCollapsed: boolean;
}

/** The defaults used when no preferences are stored yet. */
export const DEFAULT_EDITOR_PREFERENCES: EditorPreferences = {
  previewWidth: 640,
  previewPaneWidth: 440,
  paletteCollapsed: false,
  inspectorCollapsed: false,
};

/**
 * Loads the editor preferences from localStorage, falling back to defaults for
 * missing or invalid values.
 *
 * @returns The stored preferences merged over the defaults.
 */
export function loadPreferences(): EditorPreferences {
  try {
    const raw = localStorage.getItem(EDITOR_PREFERENCES_KEY);
    if (!raw) {
      return DEFAULT_EDITOR_PREFERENCES;
    }
    return { ...DEFAULT_EDITOR_PREFERENCES, ...(JSON.parse(raw) as Partial<EditorPreferences>) };
  } catch {
    return DEFAULT_EDITOR_PREFERENCES;
  }
}

/**
 * Persists the editor preferences to localStorage.
 *
 * @param preferences - The preferences to store.
 */
export function savePreferences(preferences: EditorPreferences): void {
  try {
    localStorage.setItem(EDITOR_PREFERENCES_KEY, JSON.stringify(preferences));
  } catch {
    // Ignore storage errors (e.g. private mode quota).
  }
}
