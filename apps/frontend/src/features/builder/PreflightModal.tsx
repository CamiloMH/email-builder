import { PreflightSeverity, analyzeTemplate, type TemplateDocument } from '@email/core';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/controls';
import { blockSummary } from './block-summary';

interface PreflightModalProps {
  /** Whether the modal is open. */
  open: boolean;
  /** The document to analyze. */
  document: TemplateDocument;
  /** Close handler. */
  onClose: () => void;
  /** Locates a block (called when an issue's block link is clicked). */
  onSelectBlock?: (blockId: string) => void;
  /** Proceed-with-export handler. When omitted, the modal is a plain review. */
  onConfirm?: () => void;
}

/**
 * Preflight review: runs the heuristic analyzer and lists issues with a score.
 * Block-specific issues link to the offending block; when opened from the export
 * flow it also offers "export anyway".
 */
export const PreflightModal = ({
  open,
  document,
  onClose,
  onSelectBlock,
  onConfirm,
}: PreflightModalProps): ReactNode => {
  const { t } = useTranslation();
  const report = analyzeTemplate(document);

  // Resolves the offending block's label, 1-based position and a content preview
  // so the user can tell exactly which block (e.g. which of several "Text"
  // blocks) the issue refers to.
  const blockInfo = (
    blockId: string,
  ): { label: string; position: number; summary: string } | null => {
    const index = document.blocks.findIndex((item) => item.id === blockId);
    const block = document.blocks[index];
    if (!block) {
      return null;
    }
    return { label: t(`blocks.${block.type}.label`), position: index + 1, summary: blockSummary(block) };
  };

  return (
    <Modal open={open} title={t('preflight.title')} onClose={onClose}>
      <div className="flex flex-col gap-4 p-4">
        <p className="text-sm font-semibold text-gray-800">
          {t('preflight.score', { score: report.score })}
        </p>

        {report.issues.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-green-700">
            <CheckCircle2 size={16} aria-hidden /> {t('preflight.noIssues')}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {report.issues.map((issue, index) => {
              const icon =
                issue.severity === PreflightSeverity.Error ? (
                  <XCircle size={16} className="mt-0.5 shrink-0 text-red-600" aria-hidden />
                ) : (
                  <AlertTriangle size={16} className="mt-0.5 shrink-0 text-yellow-600" aria-hidden />
                );
              const message = t(`preflight.issues.${issue.code}`);
              const blockId = issue.blockId;

              const info = blockId ? blockInfo(blockId) : null;
              if (blockId && info && onSelectBlock) {
                return (
                  <li key={index}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectBlock(blockId);
                        onClose();
                      }}
                      className="flex w-full items-start gap-2 rounded-md p-1 text-left text-sm text-gray-700 transition hover:bg-gray-50"
                    >
                      {icon}
                      <span className="min-w-0 flex-1">
                        <span>{message}</span>
                        <span className="mt-0.5 block truncate text-xs">
                          <span className="font-medium text-brand-600">
                            {t('preflight.goToBlock', { block: info.label, position: info.position })}
                          </span>
                          {info.summary ? (
                            <span className="text-gray-400"> · {info.summary}</span>
                          ) : null}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              }
              return (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  {icon}
                  <span>{message}</span>
                </li>
              );
            })}
          </ul>
        )}

        <div className="flex justify-end gap-2">
          {onConfirm ? (
            <>
              <Button variant="secondary" onClick={onClose}>
                {t('preflight.back')}
              </Button>
              <Button onClick={onConfirm}>{t('preflight.exportAnyway')}</Button>
            </>
          ) : (
            <Button onClick={onClose}>{t('common.close')}</Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
