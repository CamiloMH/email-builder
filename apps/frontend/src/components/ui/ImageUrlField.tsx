import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebouncedValue } from '../../lib/use-debounced-value';
import { notify } from '../../lib/toast';
import { useImageErrorsStore } from '../../store/image-errors-store';
import { Field, TextInput } from './controls';

/** Validation status of the image URL. */
type Status = 'idle' | 'ok' | 'error';

interface ImageUrlFieldProps {
  /** Field label. */
  label: string;
  /** Current URL value. */
  value: string;
  /** Change handler receiving the new raw value. */
  onChange: (value: string) => void;
}

/** Delay before validating a typed URL (avoids checking every keystroke). */
const VALIDATE_DEBOUNCE_MS = 500;

/**
 * Text input for an image URL that verifies the image actually loads. On
 * failure it shows an inline error, fires a toast, and records the URL as broken
 * so the live preview skips it. The value is still committed so the user keeps
 * what they typed and can fix it.
 */
export const ImageUrlField = ({ label, value, onChange }: ImageUrlFieldProps): ReactNode => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<Status>('idle');
  const debounced = useDebouncedValue(value, VALIDATE_DEBOUNCE_MS);
  const markBroken = useImageErrorsStore((state) => state.markBroken);
  const markValid = useImageErrorsStore((state) => state.markValid);

  useEffect(() => {
    const url = debounced.trim();
    if (!url) {
      setStatus('idle');
      return;
    }
    let active = true;
    const image = new Image();
    image.onload = () => {
      if (active) {
        setStatus('ok');
        markValid(url);
      }
    };
    image.onerror = () => {
      if (active) {
        setStatus('error');
        markBroken(url);
        notify.error(t('inspector.imageError'));
      }
    };
    image.src = url;
    return () => {
      active = false;
    };
  }, [debounced, markBroken, markValid, t]);

  return (
    <Field label={label}>
      <TextInput
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={status === 'error' || undefined}
      />
      {status === 'error' ? (
        <span className="mt-1 text-xs text-red-600">{t('inspector.imageError')}</span>
      ) : null}
    </Field>
  );
};
