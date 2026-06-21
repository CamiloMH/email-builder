import { ApiErrorCode, defaultErrorCodeForStatus, type ApiErrorBody } from '@email/core';
import { getClientId } from './client-id';

/** Base URL of the backend API (overridable via `VITE_API_URL`). */
export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3005';

const HTTP_NO_CONTENT = 204;

/**
 * Error thrown when an API request fails. Carries a stable {@link ApiErrorCode}
 * so the UI can show a localized, actionable message.
 */
export class ApiError extends Error {
  /**
   * @param status - The HTTP status code (0 when the request never completed).
   * @param code - The stable error code.
   * @param detail - Optional human-readable detail from the server.
   */
  constructor(
    public readonly status: number,
    public readonly code: ApiErrorCode = ApiErrorCode.Unknown,
    public readonly detail?: string,
  ) {
    super(detail ?? `API request failed with status ${status}`);
    this.name = 'ApiError';
  }
}

/**
 * Builds an {@link ApiError} from a failed response, reading the structured
 * `{ code, message }` body when present.
 *
 * @param response - The non-ok fetch response.
 * @returns The corresponding {@link ApiError}.
 */
export async function toApiError(response: Response): Promise<ApiError> {
  let code = defaultErrorCodeForStatus(response.status);
  let detail: string | undefined;
  try {
    const body = (await response.json()) as Partial<ApiErrorBody>;
    if (body && typeof body === 'object') {
      if (body.code) {
        code = body.code;
      }
      if (typeof body.message === 'string') {
        detail = body.message;
      }
    }
  } catch {
    // Non-JSON error body; fall back to the status-derived code.
  }
  return new ApiError(response.status, code, detail);
}

/**
 * Performs a JSON API request against the backend, attaching the anonymous
 * client id header and throwing {@link ApiError} on failure.
 *
 * @typeParam T - The expected response body type.
 * @param path - The request path (e.g. `/templates`).
 * @param options - Optional fetch options.
 * @returns The parsed response body (or `undefined` for 204 responses).
 */
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': getClientId(),
        ...options.headers,
      },
    });
  } catch {
    throw new ApiError(0, ApiErrorCode.Network);
  }

  if (!response.ok) {
    throw await toApiError(response);
  }

  if (response.status === HTTP_NO_CONTENT) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
