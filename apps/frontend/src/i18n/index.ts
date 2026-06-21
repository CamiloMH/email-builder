import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import es from './locales/es.json';

/** Supported UI languages. */
export const Language = {
  Es: 'es',
  En: 'en',
} as const;

/** A supported UI language code. */
export type Language = (typeof Language)[keyof typeof Language];

/** All supported languages, for the language selector. */
export const SUPPORTED_LANGUAGES: readonly Language[] = [Language.Es, Language.En];

/** localStorage key persisting the chosen language across sessions. */
export const LANGUAGE_STORAGE_KEY = 'email-builder-language';

// Reads the persisted language, defaulting to Spanish.
function initialLanguage(): Language {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === Language.Es || stored === Language.En) {
      return stored;
    }
  } catch {
    // Ignore storage errors (e.g. private mode).
  }
  return Language.Es;
}

// Initialized synchronously with inline resources so `t()` is ready on first
// render (and tests that assert Spanish text keep passing).
void i18next.use(initReactI18next).init({
  resources: { es: { translation: es }, en: { translation: en } },
  lng: initialLanguage(),
  fallbackLng: Language.Es,
  interpolation: { escapeValue: false },
  returnNull: false,
});

/**
 * Switches the UI language and persists the choice.
 *
 * @param language - The language to activate.
 */
export function setLanguage(language: Language): void {
  void i18next.changeLanguage(language);
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Ignore storage errors.
  }
}

export default i18next;
