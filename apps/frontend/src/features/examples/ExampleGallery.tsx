import { EXAMPLE_TEMPLATES, type ExampleTemplate } from '@email/core';
import { renderTemplate } from '@email/emails';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/controls';
import { Modal } from '../../components/ui/Modal';
import { useLocalePath } from '../../i18n/use-locale-path';
import { useCreateTemplate } from '../../hooks/use-templates';

/**
 * Gallery of curated example templates. Each card can be previewed (rendered on
 * demand) or copied into the visitor's templates and opened in the editor.
 */
export const ExampleGallery = (): ReactNode => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const path = useLocalePath();
  const createTemplate = useCreateTemplate();
  const [preview, setPreview] = useState<ExampleTemplate | null>(null);
  const [previewHtml, setPreviewHtml] = useState('');

  // Localized display name/description/sector for an example (the example data
  // itself lives in `@email/core` in Spanish; translations live in the frontend).
  const exampleName = (example: ExampleTemplate): string => t(`examples.items.${example.id}.name`);
  const exampleDescription = (example: ExampleTemplate): string =>
    t(`examples.items.${example.id}.description`);
  const sectorLabel = (example: ExampleTemplate): string => t(`examples.sectors.${example.sector}`);

  const useExample = async (example: ExampleTemplate): Promise<void> => {
    const created = await createTemplate.mutateAsync({
      ...example.build(),
      name: exampleName(example),
    });
    navigate(path(`/editor/${created.id}`));
  };

  const openPreview = (example: ExampleTemplate): void => {
    setPreview(example);
    setPreviewHtml('');
    void renderTemplate(example.build())
      .then((result) => setPreviewHtml(result.html))
      .catch(() => setPreviewHtml(`<p>${t('examples.previewError')}</p>`));
  };

  return (
    <section aria-labelledby="examples-heading">
      <h2 id="examples-heading" className="text-lg font-bold text-gray-900">
        {t('examples.heading')}
      </h2>
      <p className="mb-4 text-sm text-gray-500">{t('examples.subtitle')}</p>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {EXAMPLE_TEMPLATES.map((example) => (
          <li
            key={example.id}
            className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
          >
            <div className="h-2" style={{ backgroundColor: example.accentColor }} aria-hidden />
            <div className="flex flex-1 flex-col p-5">
              <span className="mb-2 inline-block w-fit rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
                {sectorLabel(example)}
              </span>
              <h3 className="font-semibold text-gray-900">{exampleName(example)}</h3>
              <p className="mt-1 flex-1 text-sm text-gray-500">{exampleDescription(example)}</p>
              <div className="mt-4 flex gap-2">
                <Button onClick={() => void useExample(example)} disabled={createTemplate.isPending}>
                  {t('examples.useTemplate')}
                </Button>
                <Button variant="secondary" onClick={() => openPreview(example)}>
                  {t('examples.preview')}
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <Modal
        open={preview !== null}
        title={preview ? t('examples.previewTitle', { name: exampleName(preview) }) : ''}
        onClose={() => setPreview(null)}
      >
        {preview ? (
          <div className="bg-gray-100 p-4">
            <iframe
              title={t('examples.previewAria')}
              srcDoc={previewHtml}
              className="h-[60vh] w-full rounded-lg border border-gray-200 bg-white"
            />
            <div className="mt-3 flex justify-end">
              <Button onClick={() => void useExample(preview)} disabled={createTemplate.isPending}>
                {t('examples.useThisTemplate')}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </section>
  );
};
