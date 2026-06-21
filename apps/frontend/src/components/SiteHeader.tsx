import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useLocalePath } from '../i18n/use-locale-path';
import { LanguageSelector } from './LanguageSelector';
import { Logo } from './Logo';

interface SiteHeaderProps {
  /** Optional nav content shown before the language selector (e.g. anchors). */
  nav?: ReactNode;
  /** Optional right-side actions (e.g. a CTA or the help button). */
  actions?: ReactNode;
}

/**
 * Shared top header for the landing and the app, so branding and the language
 * selector look and behave identically across pages. The brand links to the
 * localized home; pages inject their own `nav`/`actions`.
 */
export const SiteHeader = ({ nav, actions }: SiteHeaderProps): ReactNode => {
  const path = useLocalePath();
  return (
    <header className="border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to={path()} className="flex items-center gap-2 font-bold text-gray-900">
          <Logo size={24} /> Email Builder
        </Link>
        <nav className="flex items-center gap-3 text-sm font-medium text-gray-600 sm:gap-4">
          {nav}
          <span data-tour="language">
            <LanguageSelector />
          </span>
          {actions}
        </nav>
      </div>
    </header>
  );
};
