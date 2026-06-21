import { useParams } from 'react-router-dom';
import { Language } from './index';

/**
 * Returns the active language from the `:lang` route segment, defaulting to
 * Spanish when absent or unknown.
 *
 * @returns The current {@link Language}.
 */
export function useLang(): Language {
  const { lang } = useParams();
  return lang === Language.En ? Language.En : Language.Es;
}

/**
 * Returns a helper that prefixes an in-app path with the current language
 * segment, so all links and navigations stay under `/es` or `/en`.
 *
 * @returns A function mapping `/app` → `/es/app` (and `''`/`'/'` → `/es`).
 */
export function useLocalePath(): (path?: string) => string {
  const lang = useLang();
  return (path = '') => {
    const suffix = path === '/' ? '' : path;
    return `/${lang}${suffix}`;
  };
}
