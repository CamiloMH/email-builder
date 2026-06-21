import { describe, expect, it } from 'vitest';
import { templateDocumentSchema } from '../template/template.schema';
import { ExampleSector } from './example-template';
import { EXAMPLE_TEMPLATES } from './examples';

describe('EXAMPLE_TEMPLATES', () => {
  it('provides at least six examples with unique ids, known sectors and hex accents', () => {
    expect(EXAMPLE_TEMPLATES.length).toBeGreaterThanOrEqual(6);
    const ids = EXAMPLE_TEMPLATES.map((example) => example.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const example of EXAMPLE_TEMPLATES) {
      expect(Object.values(ExampleSector)).toContain(example.sector);
      expect(example.accentColor).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it.each(EXAMPLE_TEMPLATES.map((example) => [example.id, example] as const))(
    'builds a schema-valid document for %s',
    (_id, example) => {
      const document = example.build();
      expect(() => templateDocumentSchema.parse(document)).not.toThrow();
      const blockIds = document.blocks.map((block) => block.id);
      expect(new Set(blockIds).size).toBe(blockIds.length);
      expect(document.blocks.length).toBeGreaterThan(0);
    },
  );

  it('generates fresh block ids on every build', () => {
    const [example] = EXAMPLE_TEMPLATES;
    expect(example?.build().blocks[0]?.id).not.toBe(example?.build().blocks[0]?.id);
  });
});
