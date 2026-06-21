import { describe, expect, it } from 'vitest';
import { BlockType } from '../blocks/block.schema';
import { createDefaultTemplate } from './template.factory';
import {
  parseTemplateDocument,
  safeParseTemplateDocument,
  templateDocumentSchema,
} from './template.schema';

describe('createDefaultTemplate', () => {
  it('produces a schema-valid document', () => {
    const template = createDefaultTemplate();
    expect(() => templateDocumentSchema.parse(template)).not.toThrow();
  });

  it('starts with header, text, button and footer blocks', () => {
    const template = createDefaultTemplate('Promo');
    expect(template.name).toBe('Promo');
    expect(template.blocks.map((block) => block.type)).toEqual([
      BlockType.Header,
      BlockType.Text,
      BlockType.Button,
      BlockType.Footer,
    ]);
  });

  it('defaults the name when none is given', () => {
    expect(createDefaultTemplate().name).toBe('Untitled template');
  });
});

describe('parseTemplateDocument', () => {
  it('returns the parsed document for valid input', () => {
    const template = createDefaultTemplate();
    expect(parseTemplateDocument(template)).toEqual(template);
  });

  it('throws on invalid input', () => {
    expect(() => parseTemplateDocument({ name: '', theme: {}, blocks: [] })).toThrow();
  });
});

describe('safeParseTemplateDocument', () => {
  it('reports success for a valid document', () => {
    expect(safeParseTemplateDocument(createDefaultTemplate()).success).toBe(true);
  });

  it('reports failure without throwing for invalid input', () => {
    expect(safeParseTemplateDocument(null).success).toBe(false);
  });
});
