import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { SUPPORTED_LANGUAGES, setLanguage, type Language } from '../i18n';

/**
 * Compact, borderless language switcher (ES/EN): just the dropdown control.
 * Persists the choice and swaps the `:lang` segment in the URL so the path
 * always reflects the active language.
 */
export const LanguageSelector = (): ReactNode => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const change = (next: Language): void => {
    setLanguage(next);
    const rest = location.pathname.replace(/^\/[^/]+/, '');
    navigate(`/${next}${rest}${location.search}`, { replace: true });
  };

  return (
    <select
      aria-label={t('language.label')}
      value={i18n.language}
      onChange={(event) => change(event.target.value as Language)}
      className="cursor-pointer rounded-md border-0 bg-transparent px-1 py-1 text-xs font-medium text-gray-600 outline-none hover:text-gray-900"
    >
      {SUPPORTED_LANGUAGES.map((language) => (
        <option key={language} value={language}>
          {t(`language.${language}`)}
        </option>
      ))}
    </select>
  );
};
