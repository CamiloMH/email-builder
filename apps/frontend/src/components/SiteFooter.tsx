import { Github, Linkedin } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

/** Public profile links shown in the footer. */
const GITHUB_URL = 'https://github.com/CamiloMH';
const LINKEDIN_URL =
  'https://www.linkedin.com/in/camilo-ignacio-mu%C3%B1oz-huenchuman-0ab937204/';

/**
 * Site footer shared by the landing page and the app dashboard. Surfaces the
 * author's GitHub and LinkedIn profiles.
 */
export const SiteFooter = (): ReactNode => {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-gray-200 py-8 text-sm text-gray-500">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 sm:flex-row sm:justify-between sm:px-6">
        <p>{t('footer.madeBy')}</p>
        <nav className="flex flex-wrap items-center justify-center gap-3" aria-label={t('footer.social')}>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={t('footer.github')}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 transition hover:text-gray-900"
          >
            <Github size={16} aria-hidden /> GitHub
          </a>
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={t('footer.linkedin')}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 transition hover:text-gray-900"
          >
            <Linkedin size={16} aria-hidden /> LinkedIn
          </a>
        </nav>
      </div>
    </footer>
  );
};
