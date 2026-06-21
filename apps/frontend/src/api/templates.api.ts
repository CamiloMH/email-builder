import { ApiErrorCode, type TemplateDocument } from '@email/core';
import { ApiError, toApiError } from '../lib/api-client';
import { templatesRepo } from '../lib/templates-repo';
import type { TemplateResponse } from './types';

/** Endpoint of the serverless test-send function (overridable via env). */
export const SEND_ENDPOINT =
  (import.meta.env.VITE_SEND_ENDPOINT as string | undefined) ?? '/api/send-test';

/** Payload sent to the serverless email function. */
export interface SendTestPayload {
  /** Recipient address. */
  to: string;
  /** Email subject. */
  subject: string;
  /** Rendered HTML body. */
  html: string;
  /** Rendered plain-text body. */
  text: string;
}

/**
 * Template client. Persistence is local (`localStorage`) so the app runs as a
 * static site; only the test-send goes to a serverless function that holds the
 * email provider credentials.
 */
export const templatesApi = {
  /** Lists the visitor's templates, most-recently-updated first. */
  list: (): Promise<TemplateResponse[]> => Promise.resolve(templatesRepo.list()),

  /** Fetches a single template by id, rejecting with a 404 when missing. */
  get: (id: string): Promise<TemplateResponse> => {
    const template = templatesRepo.get(id);
    return template
      ? Promise.resolve(template)
      : Promise.reject(new ApiError(404, ApiErrorCode.TemplateNotFound));
  },

  /** Creates a new template. */
  create: (document: TemplateDocument): Promise<TemplateResponse> =>
    Promise.resolve(templatesRepo.create(document)),

  /** Replaces an existing template, rejecting with a 404 when missing. */
  update: (id: string, document: TemplateDocument): Promise<TemplateResponse> => {
    const template = templatesRepo.update(id, document);
    return template
      ? Promise.resolve(template)
      : Promise.reject(new ApiError(404, ApiErrorCode.TemplateNotFound));
  },

  /** Deletes a template. */
  remove: (id: string): Promise<void> => {
    templatesRepo.remove(id);
    return Promise.resolve();
  },

  /**
   * Sends a rendered test email through the serverless function. The browser
   * renders the email (it already has the engine) and posts the result, so the
   * function only needs the provider API key — never exposed to the client.
   *
   * @param payload - Recipient and rendered email content.
   * @returns Whether the email was sent.
   */
  sendTest: async (payload: SendTestPayload): Promise<{ sent: boolean }> => {
    let response: Response;
    try {
      response = await fetch(SEND_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      throw new ApiError(0, ApiErrorCode.Network);
    }
    if (!response.ok) {
      throw await toApiError(response);
    }
    return (await response.json()) as { sent: boolean };
  },
};
