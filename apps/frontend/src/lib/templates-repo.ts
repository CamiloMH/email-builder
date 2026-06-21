import { generateId, type TemplateDocument } from '@email/core';
import type { TemplateResponse } from '../api/types';

/** localStorage key holding the visitor's templates. */
export const TEMPLATES_KEY = 'email-builder-templates';

// Loads the stored templates, tolerating missing/corrupt storage.
function load(): TemplateResponse[] {
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY);
    return raw ? (JSON.parse(raw) as TemplateResponse[]) : [];
  } catch {
    return [];
  }
}

// Persists the templates, ignoring storage errors (quota/private mode).
function persist(templates: TemplateResponse[]): void {
  try {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  } catch {
    // Ignore storage errors.
  }
}

function now(): string {
  return new Date().toISOString();
}

/**
 * Client-side template store backed by `localStorage`. Replaces the backend CRUD
 * so the app can run as a fully static site (templates are per-browser).
 */
export const templatesRepo = {
  /** Lists templates, most-recently-updated first. */
  list(): TemplateResponse[] {
    return load().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  /** Returns a single template by id, or `undefined`. */
  get(id: string): TemplateResponse | undefined {
    return load().find((template) => template.id === id);
  },

  /** Creates a template from a document and returns it. */
  create(document: TemplateDocument): TemplateResponse {
    const timestamp = now();
    const template: TemplateResponse = {
      ...document,
      id: generateId(),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    persist([template, ...load()]);
    return template;
  },

  /** Replaces an existing template's document, bumping `updatedAt`. */
  update(id: string, document: TemplateDocument): TemplateResponse | undefined {
    const templates = load();
    const existing = templates.find((template) => template.id === id);
    if (!existing) {
      return undefined;
    }
    const updated: TemplateResponse = { ...existing, ...document, id, updatedAt: now() };
    persist(templates.map((template) => (template.id === id ? updated : template)));
    return updated;
  },

  /** Removes a template by id. */
  remove(id: string): void {
    persist(load().filter((template) => template.id !== id));
  },
};
