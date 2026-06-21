import { BlockFactory } from '@email/core';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { blockIcon } from '../../components/icons';
import { useBlocks } from '../../hooks/use-blocks';
import { useBuilderStore } from '../../store/builder-store';

/**
 * Palette of available block kinds. Clicking a block appends it to the canvas.
 */
export const BlockPalette = (): ReactNode => {
  const { t } = useTranslation();
  const { data: blocks, isLoading, isError } = useBlocks();
  const addBlock = useBuilderStore((state) => state.addBlock);

  if (isLoading) {
    return <p className="p-4 text-sm text-gray-500">{t('palette.loading')}</p>;
  }
  if (isError || !blocks) {
    return <p className="p-4 text-sm text-red-600">{t('palette.error')}</p>;
  }

  return (
    <div className="flex flex-col gap-2 p-3">
      {blocks.map((definition) => {
        const Icon = blockIcon(definition.icon);
        return (
          <button
            key={definition.type}
            type="button"
            onClick={() => addBlock(BlockFactory.create(definition.type))}
            className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 text-left transition hover:border-brand-500 hover:shadow-sm"
          >
            <Icon size={18} className="mt-0.5 shrink-0 text-brand-500" aria-hidden />
            <span className="flex flex-col">
              <span className="text-sm font-semibold text-gray-800">
                {t(`blocks.${definition.type}.label`)}
              </span>
              <span className="text-xs text-gray-500">
                {t(`blocks.${definition.type}.description`)}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
};
