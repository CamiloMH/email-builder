import { HelpCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton } from '../../components/ui/controls';

/**
 * Icon button that (re)starts the guided tour for the current screen.
 */
export const HelpButton = ({ onClick }: { onClick: () => void }): ReactNode => {
  const { t } = useTranslation();
  return (
    <IconButton label={t('tour.help')} onClick={onClick}>
      <HelpCircle size={18} aria-hidden />
    </IconButton>
  );
};
