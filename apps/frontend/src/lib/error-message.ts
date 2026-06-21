import { ApiErrorCode } from '@email/core';
import type { TFunction } from 'i18next';
import { ApiError } from './api-client';

/**
 * Resolves a localized, user-facing message for a failed request. Uses the
 * stable {@link ApiErrorCode} carried by {@link ApiError}, falling back to a
 * generic message for unknown errors.
 *
 * @param error - The thrown error (typically an {@link ApiError}).
 * @param t - The i18n translation function.
 * @returns A localized error message.
 */
export function apiErrorMessage(error: unknown, t: TFunction): string {
  const code = error instanceof ApiError ? error.code : ApiErrorCode.Unknown;
  return t(`errors.${code}`);
}
