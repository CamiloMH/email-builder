import { generateId } from '@email/core';

/** localStorage key under which the anonymous client id is persisted. */
export const CLIENT_ID_STORAGE_KEY = 'email-builder-client-id';

/**
 * Returns the anonymous client id for this browser, generating and persisting
 * one on first use. Sent as the `x-client-id` header so the backend can isolate
 * each visitor's templates without authentication.
 *
 * @returns The persistent anonymous client id.
 */
export function getClientId(): string {
  const existing = localStorage.getItem(CLIENT_ID_STORAGE_KEY);
  if (existing) {
    return existing;
  }
  const id = generateId();
  localStorage.setItem(CLIENT_ID_STORAGE_KEY, id);
  return id;
}
