/**
 * Stable, framework-agnostic error codes returned by the API and understood by
 * the frontend. The UI maps each code to a localized message, so users get a
 * clear reason for a failure regardless of language.
 */
export const ApiErrorCode = {
  /** Unexpected/unclassified server error. */
  Unknown: 'unknown',
  /** The request never reached the server (offline, DNS, CORS). */
  Network: 'network',
  /** Request payload failed validation. */
  ValidationFailed: 'validationFailed',
  /** Generic resource not found. */
  NotFound: 'notFound',
  /** The requested template does not exist or is not owned by the visitor. */
  TemplateNotFound: 'templateNotFound',
  /** Too many requests in the rate-limit window. */
  RateLimited: 'rateLimited',
  /** Email delivery is not configured (no provider credentials). */
  MailNotConfigured: 'mailNotConfigured',
  /** The email provider rejected or failed to send the message. */
  MailSendFailed: 'mailSendFailed',
} as const;

/** A stable API error code. */
export type ApiErrorCode = (typeof ApiErrorCode)[keyof typeof ApiErrorCode];

/** All error codes, for validation and exhaustive UI mapping. */
export const API_ERROR_CODE_VALUES: readonly ApiErrorCode[] = Object.values(ApiErrorCode);

/**
 * Shape of an error response body returned by the API.
 */
export interface ApiErrorBody {
  /** HTTP status code. */
  statusCode: number;
  /** Stable, localizable error code. */
  code: ApiErrorCode;
  /** Human-readable detail (may include provider messages). */
  message: string;
}

/**
 * Maps an HTTP status to a default {@link ApiErrorCode} when no explicit code
 * was provided by the thrower.
 *
 * @param status - The HTTP status code.
 * @returns The matching default error code.
 */
export function defaultErrorCodeForStatus(status: number): ApiErrorCode {
  switch (status) {
    case 400:
      return ApiErrorCode.ValidationFailed;
    case 404:
      return ApiErrorCode.NotFound;
    case 429:
      return ApiErrorCode.RateLimited;
    default:
      return ApiErrorCode.Unknown;
  }
}
