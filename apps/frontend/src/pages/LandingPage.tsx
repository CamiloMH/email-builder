import {
  ArrowRight,
  Eye,
  FileDown,
  LayoutGrid,
  MousePointerClick,
  Palette,
  UserCheck,
  type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { RisingDots } from '../components/RisingDots';
import { SiteFooter } from '../components/SiteFooter';
import { SiteHeader } from '../components/SiteHeader';
import { MAIN_CONTENT_ID, SkipLink } from '../components/SkipLink';
import { useLocalePath } from '../i18n/use-locale-path';
import { useDocumentTitle } from '../hooks/use-document-title';

/** Icons for the feature cards, matched by index to the `landing.features` copy. */
const FEATURE_ICONS: readonly LucideIcon[] = [LayoutGrid, Eye, FileDown, UserCheck];

/** Icons for the steps, matched by index to the `landing.steps` copy. */
const STEP_ICONS: readonly LucideIcon[] = [LayoutGrid, Palette, Eye, FileDown];

/** A localized title/description entry for features and steps. */
interface CopyEntry {
  title: string;
  description: string;
}

/** Brand link styled as a primary button. */
const PrimaryLink = ({ to, children }: { to: string; children: ReactNode }): ReactNode => (
  <Link
    to={to}
    className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
  >
    {children}
  </Link>
);

/**
 * Marketing landing page (home). Presents the product and routes visitors to the
 * builder. Fully responsive: a single column on mobile, multi-column on larger
 * screens.
 */
export const LandingPage = (): ReactNode => {
  const { t } = useTranslation();
  const path = useLocalePath();
  useDocumentTitle(t('landing.documentTitle'));
  const features = t('landing.features', { returnObjects: true }) as CopyEntry[];
  const steps = t('landing.steps', { returnObjects: true }) as CopyEntry[];

  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-gray-900">
      <RisingDots />
      <div className="relative z-10">
      <SkipLink />
      <SiteHeader
        nav={
          <>
            <a href="#features" className="hidden hover:text-gray-900 sm:inline">
              {t('landing.navFeatures')}
            </a>
            <a href="#how" className="hidden hover:text-gray-900 sm:inline">
              {t('landing.navHow')}
            </a>
          </>
        }
        actions={<PrimaryLink to={path('/app')}>{t('landing.goToEditor')}</PrimaryLink>}
      />

      <main id={MAIN_CONTENT_ID}>
        <section className="mx-auto max-w-3xl px-4 pb-12 pt-16 text-center sm:px-6 sm:pt-24">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            {t('landing.heroTitle')}{' '}
            <span className="text-brand-500">{t('landing.heroTitleAccent')}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-gray-600">{t('landing.heroSubtitle')}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <PrimaryLink to={path('/app')}>
              {t('landing.startFree')} <ArrowRight size={16} />
            </PrimaryLink>
            <a
              href="#features"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
            >
              {t('landing.seeFeatures')}
            </a>
          </div>

          {/* Decorative editor mockup */}
          <div className="mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3 shadow-sm sm:grid-cols-[1fr_2fr_1fr]">
            <div className="hidden flex-col gap-2 rounded-lg bg-white p-3 sm:flex" aria-hidden>
              <div className="h-3 w-16 rounded bg-brand-100" />
              <div className="h-8 rounded bg-gray-100" />
              <div className="h-8 rounded bg-gray-100" />
              <div className="h-8 rounded bg-gray-100" />
            </div>
            <div className="flex flex-col gap-2 rounded-lg bg-white p-4" aria-hidden>
              <div className="mx-auto h-4 w-2/3 rounded bg-gray-200" />
              <div className="mx-auto h-3 w-1/2 rounded bg-gray-100" />
              <div className="mx-auto mt-2 h-8 w-28 rounded bg-brand-500" />
              <div className="mt-2 h-2 w-full rounded bg-gray-100" />
              <div className="h-2 w-5/6 rounded bg-gray-100" />
            </div>
            <div className="hidden flex-col gap-2 rounded-lg bg-white p-3 sm:flex" aria-hidden>
              <div className="h-3 w-12 rounded bg-accent-500/30" />
              <div className="h-6 rounded bg-gray-100" />
              <div className="h-6 rounded bg-gray-100" />
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-3xl font-bold">{t('landing.featuresHeading')}</h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = FEATURE_ICONS[index] ?? LayoutGrid;
              return (
                <article
                  key={feature.title}
                  className="rounded-xl border border-gray-200 bg-white p-6"
                >
                  <Icon className="text-brand-500" size={24} aria-hidden />
                  <h3 className="mt-4 font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section id="how" className="border-t border-gray-100 bg-gray-50 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold sm:text-4xl">{t('landing.howHeading')}</h2>
              <p className="mt-3 text-gray-600">{t('landing.howSubtitle')}</p>
            </div>

            <ol className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, index) => {
                const Icon = STEP_ICONS[index] ?? LayoutGrid;
                return (
                  <li key={step.title}>
                    <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md">
                      <div className="flex items-center justify-between">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                          <Icon size={22} aria-hidden />
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          {t('landing.step', { n: index + 1 })}
                        </span>
                      </div>
                      <h3 className="mt-4 font-semibold text-gray-900">{step.title}</h3>
                      <p className="mt-2 text-sm text-gray-600">{step.description}</p>
                    </div>
                  </li>
                );
              })}
            </ol>

            <div className="mt-12 flex justify-center">
              <PrimaryLink to={path('/app')}>
                {t('landing.tryEditor')} <ArrowRight size={16} />
              </PrimaryLink>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <h2 className="text-3xl font-bold sm:text-4xl">{t('landing.ctaHeading')}</h2>
          <p className="mt-3 text-gray-600">{t('landing.ctaSubtitle')}</p>
          <div className="mt-8 flex justify-center">
            <PrimaryLink to={path('/app')}>
              <MousePointerClick size={16} /> {t('landing.ctaButton')}
            </PrimaryLink>
          </div>
        </section>
      </main>

      <SiteFooter />
      </div>
    </div>
  );
};
