import { toast, type ToastOptions } from 'react-toastify';

/** Shared toast options for consistent placement and timing. */
const DEFAULTS: ToastOptions = { position: 'bottom-right', autoClose: 3500 };

/**
 * Thin wrapper over react-toastify so the rest of the app emits notifications
 * through one consistent API (and styling).
 */
export const notify = {
  /** Shows a success toast. */
  success: (message: string): void => {
    toast.success(message, DEFAULTS);
  },
  /** Shows an error toast. */
  error: (message: string): void => {
    toast.error(message, DEFAULTS);
  },
  /** Shows an informational toast. */
  info: (message: string): void => {
    toast.info(message, DEFAULTS);
  },
};
