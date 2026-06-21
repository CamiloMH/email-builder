import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../components/ui/Modal';
import { Button, Field, TextInput } from '../../components/ui/controls';

/** Status of the in-flight test send. */
export const SendStatus = {
  Idle: 'idle',
  Pending: 'pending',
  Success: 'success',
  Error: 'error',
} as const;

/** A test-send status value. */
export type SendStatus = (typeof SendStatus)[keyof typeof SendStatus];

interface SendTestModalProps {
  /** Whether the modal is open. */
  open: boolean;
  /** Current send status. */
  status: SendStatus;
  /** Close handler. */
  onClose: () => void;
  /** Submit handler receiving the recipient address. */
  onSubmit: (to: string) => void;
}

/**
 * Modal asking for a recipient and sending a test email of the current template.
 */
export const SendTestModal = ({ open, status, onClose, onSubmit }: SendTestModalProps): ReactNode => {
  const { t } = useTranslation();
  const [to, setTo] = useState('');

  return (
    <Modal open={open} title={t('send.title')} onClose={onClose}>
      <form
        className="flex flex-col gap-3 p-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(to);
        }}
      >
        <Field label={t('send.to')}>
          <TextInput
            type="email"
            required
            value={to}
            onChange={(event) => setTo(event.target.value)}
          />
        </Field>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={status === SendStatus.Pending}>
            {status === SendStatus.Pending ? t('send.sending') : t('send.submit')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
