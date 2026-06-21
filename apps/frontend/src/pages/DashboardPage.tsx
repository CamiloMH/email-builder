import { createDefaultTemplate } from '@email/core';
import { FilePlus2, Star, Trash2 } from 'lucide-react';
import { useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { RisingDots } from '../components/RisingDots';
import { SiteFooter } from '../components/SiteFooter';
import { SiteHeader } from '../components/SiteHeader';
import { MAIN_CONTENT_ID, SkipLink } from '../components/SkipLink';
import { Button, IconButton } from '../components/ui/controls';
import { ExampleGallery } from '../features/examples/ExampleGallery';
import { HelpButton } from '../features/tour/HelpButton';
import { DASHBOARD_TOUR } from '../features/tour/tour';
import { useTour } from '../features/tour/use-tour';
import { useLocalePath } from '../i18n/use-locale-path';
import { useDocumentTitle } from '../hooks/use-document-title';
import { apiErrorMessage } from '../lib/error-message';
import { notify } from '../lib/toast';
import { useCreateTemplate, useDeleteTemplate, useTemplates } from '../hooks/use-templates';
import { useFavoritesStore } from '../store/favorites-store';

/**
 * Dashboard listing the visitor's templates, with create, favorite and delete
 * actions. Favorites are listed first.
 */
export const DashboardPage = (): ReactNode => {
  const { t } = useTranslation();
  const path = useLocalePath();
  const navigate = useNavigate();
  const startTour = useTour('email-builder-tour-dashboard', DASHBOARD_TOUR);
  const { data: templates, isLoading } = useTemplates();
  const createTemplate = useCreateTemplate();
  const deleteTemplate = useDeleteTemplate();
  const favoriteIds = useFavoritesStore((state) => state.ids);
  const toggleFavorite = useFavoritesStore((state) => state.toggle);
  useDocumentTitle(t('dashboard.documentTitle'));

  const sortedTemplates = useMemo(
    () =>
      [...(templates ?? [])].sort(
        (a, b) => Number(favoriteIds.includes(b.id)) - Number(favoriteIds.includes(a.id)),
      ),
    [templates, favoriteIds],
  );

  const handleCreate = async (): Promise<void> => {
    const created = await createTemplate.mutateAsync(createDefaultTemplate(t('dashboard.untitled')));
    navigate(path(`/editor/${created.id}`));
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <RisingDots />
      <div className="relative z-10">
      <SkipLink />
      <SiteHeader actions={<HelpButton onClick={startTour} />} />
      <main id={MAIN_CONTENT_ID} className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.heading')}</h1>
            <p className="text-sm text-gray-500">{t('dashboard.subtitle')}</p>
          </div>
          <div data-tour="new-template">
            <Button onClick={() => void handleCreate()} disabled={createTemplate.isPending}>
              <FilePlus2 size={16} /> {t('dashboard.newTemplate')}
            </Button>
          </div>
        </header>

        {isLoading ? (
          <p className="text-sm text-gray-500">{t('dashboard.loading')}</p>
        ) : sortedTemplates.length > 0 ? (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sortedTemplates.map((template) => {
              const favorite = favoriteIds.includes(template.id);
              return (
                <li
                  key={template.id}
                  className="relative flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md focus-within:ring-2 focus-within:ring-brand-500"
                >
                  <button
                    type="button"
                    onClick={() => navigate(path(`/editor/${template.id}`))}
                    className="text-left outline-none after:absolute after:inset-0 after:content-['']"
                  >
                    <h2 className="font-semibold text-gray-900">{template.name}</h2>
                    <p className="mt-1 text-xs text-gray-500">
                      {t('dashboard.blocksCount', { count: template.blocks.length })} ·{' '}
                      {new Date(template.updatedAt).toLocaleDateString()}
                    </p>
                  </button>
                  <div className="relative z-10 mt-4 flex justify-end gap-1">
                    <IconButton
                      label={favorite ? t('favorite.remove') : t('favorite.add')}
                      onClick={() => toggleFavorite(template.id)}
                    >
                      <Star
                        size={16}
                        aria-hidden
                        className={
                          favorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
                        }
                      />
                    </IconButton>
                    <IconButton
                      label={t('dashboard.deleteTemplate')}
                      onClick={() =>
                        deleteTemplate.mutate(template.id, {
                          onSuccess: () => notify.success(t('dashboard.deleted')),
                          onError: (error) => notify.error(apiErrorMessage(error, t)),
                        })
                      }
                      className="hover:text-red-600"
                    >
                      <Trash2 size={16} aria-hidden />
                    </IconButton>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
            <p className="text-gray-600">{t('dashboard.empty')}</p>
            <Button className="mt-4" onClick={() => void handleCreate()}>
              <FilePlus2 size={16} /> {t('dashboard.createFirst')}
            </Button>
          </div>
        )}

        <div className="mt-12" data-tour="examples">
          <ExampleGallery />
        </div>
      </main>
      <SiteFooter />
      </div>
    </div>
  );
};
