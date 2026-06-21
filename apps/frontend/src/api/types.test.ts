import { DEFAULT_THEME } from '@email/core';
import { describe, expect, it } from 'vitest';
import { toDocument, type TemplateResponse } from './types';

describe('toDocument', () => {
  it('extracts the renderable document from an API template', () => {
    const template: TemplateResponse = {
      id: 'id-1',
      name: 'Promo',
      description: 'Hello',
      theme: DEFAULT_THEME,
      blocks: [],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
    };
    expect(toDocument(template)).toEqual({
      name: 'Promo',
      description: 'Hello',
      theme: DEFAULT_THEME,
      blocks: [],
    });
  });
});
