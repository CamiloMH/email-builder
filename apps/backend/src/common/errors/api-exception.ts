import type { ApiErrorCode } from '@email/core';
import { HttpException } from '@nestjs/common';

/**
 * HTTP exception carrying a stable {@link ApiErrorCode} in its response body, so
 * the frontend can show a localized, actionable message.
 */
export class ApiException extends HttpException {
  /**
   * @param code - The stable error code.
   * @param status - The HTTP status to respond with.
   * @param message - Optional human-readable detail (e.g. a provider message).
   */
  constructor(code: ApiErrorCode, status: number, message?: string) {
    super({ statusCode: status, code, message: message ?? code }, status);
  }
}
