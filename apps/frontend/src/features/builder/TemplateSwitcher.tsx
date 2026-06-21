import { Check, ChevronsUpDown, Star } from 'lucide-react';
import { useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { TemplateResponse } from '../../api/types';
import { useLocalePath } from '../../i18n/use-locale-path';
import { cn } from '../../lib/cn';
import { useDismiss } from '../../lib/use-dismiss';

interface TemplateSwitcherProps {
  /** The id of the template currently open. */
  currentId: string;
  /** The templates to switch between (already favorites-first). */
  templates: TemplateResponse[];
  /** The favorite template ids (for the star indicator). */
  favoriteIds: string[];
}

/**
 * A polished dropdown to jump between templates in the editor: a trigger showing
 * the current template name and a menu listing all templates with a favorite
 * star and a check on the active one. Closes on outside click or Escape.
 */
export const TemplateSwitcher = ({
  currentId,
  templates,
  favoriteIds,
}: TemplateSwitcherProps): ReactNode => {
  const { t } = useTranslation();
  const path = useLocalePath();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useDismiss(open, containerRef, () => setOpen(false));

  const current = templates.find((template) => template.id === currentId);

  const select = (id: string): void => {
    setOpen(false);
    if (id !== currentId) {
      navigate(path(`/editor/${id}`));
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={t('editor.switchTemplate')}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((previous) => !previous)}
        className="flex w-44 items-center gap-2 rounded-md border border-gray-300 px-2.5 py-1.5 text-sm text-gray-700 transition hover:bg-gray-50"
      >
        <span className="flex-1 truncate text-left">{current?.name ?? t('editor.template')}</span>
        <ChevronsUpDown size={14} className="shrink-0 text-gray-400" aria-hidden />
      </button>

      {open ? (
        <ul
          role="listbox"
          className="absolute left-0 z-20 mt-1 max-h-72 w-64 overflow-auto rounded-lg border border-gray-200 bg-white p-1 shadow-lg"
        >
          {templates.map((template) => {
            const active = template.id === currentId;
            return (
              <li key={template.id} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => select(template.id)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition',
                    active ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-100',
                  )}
                >
                  <Star
                    size={14}
                    aria-hidden
                    className={
                      favoriteIds.includes(template.id)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }
                  />
                  <span className="flex-1 truncate">{template.name}</span>
                  {active ? <Check size={14} className="shrink-0 text-brand-600" aria-hidden /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
};
