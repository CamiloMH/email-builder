import type { TemplateVariable } from '@email/core';
import { Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Field, IconButton, TextInput } from '../../components/ui/controls';
import { useBuilderStore } from '../../store/builder-store';

/** Strips characters that are not allowed in a variable key. */
function sanitizeKey(value: string): string {
  return value.replace(/[^A-Za-z0-9_]/g, '');
}

/**
 * Editor for the template's personalization variables (merge tags). Each
 * variable has a key (used as `{{key}}` in text), a label and a sample value
 * shown in the live preview and test sends.
 */
export const VariablesPanel = (): ReactNode => {
  const { t } = useTranslation();
  const document = useBuilderStore((state) => state.document);
  const setVariables = useBuilderStore((state) => state.setVariables);

  if (!document) {
    return null;
  }
  const variables = document.variables ?? [];

  const update = (index: number, patch: Partial<TemplateVariable>): void =>
    setVariables(variables.map((variable, i) => (i === index ? { ...variable, ...patch } : variable)));

  const add = (): void =>
    setVariables([
      ...variables,
      { key: `var${variables.length + 1}`, label: `${t('variables.label')} ${variables.length + 1}`, sample: '' },
    ]);

  const remove = (index: number): void =>
    setVariables(variables.filter((_, i) => i !== index));

  return (
    <div className="flex flex-col gap-3 p-4">
      <p className="text-xs text-gray-500">{t('variables.hint', { token: '{{clave}}' })}</p>

      {variables.length === 0 ? (
        <p className="text-xs text-gray-400">{t('variables.empty')}</p>
      ) : null}

      {variables.map((variable, index) => (
        <div key={index} className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <Field label={t('variables.key')}>
                <TextInput
                  value={variable.key}
                  onChange={(event) => update(index, { key: sanitizeKey(event.target.value) })}
                />
              </Field>
            </div>
            <IconButton label={t('variables.remove')} onClick={() => remove(index)} className="mt-6 hover:text-red-600">
              <Trash2 size={16} aria-hidden />
            </IconButton>
          </div>
          <Field label={t('variables.label')}>
            <TextInput value={variable.label} onChange={(event) => update(index, { label: event.target.value })} />
          </Field>
          <Field label={t('variables.sample')}>
            <TextInput value={variable.sample} onChange={(event) => update(index, { sample: event.target.value })} />
          </Field>
        </div>
      ))}

      <Button variant="secondary" onClick={add}>
        {t('variables.add')}
      </Button>
    </div>
  );
};
