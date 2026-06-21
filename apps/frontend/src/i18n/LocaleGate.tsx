import { useEffect, type ReactNode } from 'react';
import { Navigate, Outlet, useParams } from 'react-router-dom';
import i18n, { Language, SUPPORTED_LANGUAGES, setLanguage } from './index';

/**
 * Route guard for the `/:lang` segment: redirects unknown languages to Spanish
 * and keeps the active i18n language in sync with the URL. Renders the matched
 * child route via `<Outlet/>`.
 */
export const LocaleGate = (): ReactNode => {
  const { lang } = useParams();
  const valid = SUPPORTED_LANGUAGES.includes(lang as Language);

  useEffect(() => {
    if (valid && i18n.language !== lang) {
      setLanguage(lang as Language);
    }
  }, [lang, valid]);

  if (!valid) {
    return <Navigate to={`/${Language.Es}`} replace />;
  }
  return <Outlet />;
};
