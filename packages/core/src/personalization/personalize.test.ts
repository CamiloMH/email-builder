import { describe, expect, it } from 'vitest';
import { Align } from '../common/color.schema';
import { BlockType } from '../blocks/block.schema';
import { DEFAULT_THEME } from '../theme/theme.schema';
import type { TemplateDocument } from '../template/template.schema';
import {
  collectTokenKeys,
  defaultSampleValues,
  personalizeDocument,
  substituteTokens,
} from './personalize';

const doc: TemplateDocument = {
  name: 'Greeting',
  theme: DEFAULT_THEME,
  variables: [
    { key: 'name', label: 'Nombre', sample: 'Camilo' },
    { key: 'company', label: 'Empresa', sample: 'Acme' },
  ],
  blocks: [
    { id: 'h1', type: BlockType.Header, props: { title: 'Hola {{name}}', align: Align.Left } },
    {
      id: 't1',
      type: BlockType.Text,
      props: { text: 'Gracias por unirte a {{company}}, {{name}}.', align: Align.Left, fontSize: 16 },
    },
    {
      id: 'c1',
      type: BlockType.Columns,
      props: {
        columns: [
          { id: 'col1', heading: '{{company}}', text: 'Equipo' },
          { id: 'col2', text: 'Hola {{missing}}' },
        ],
      },
    },
  ],
};

describe('substituteTokens', () => {
  it('replaces known tokens and leaves unknown ones intact', () => {
    expect(substituteTokens('Hola {{name}} de {{x}}', { name: 'Ana' })).toBe('Hola Ana de {{x}}');
  });
});

describe('defaultSampleValues', () => {
  it('maps variable keys to their sample values', () => {
    expect(defaultSampleValues(doc.variables)).toEqual({ name: 'Camilo', company: 'Acme' });
  });

  it('returns an empty map with no variables', () => {
    expect(defaultSampleValues()).toEqual({});
  });
});

describe('personalizeDocument', () => {
  it('substitutes tokens across block props using sample values by default', () => {
    const result = personalizeDocument(doc);
    const header = result.blocks[0];
    const text = result.blocks[1];
    expect(header?.type === BlockType.Header && header.props.title).toBe('Hola Camilo');
    expect(text?.type === BlockType.Text && text.props.text).toBe(
      'Gracias por unirte a Acme, Camilo.',
    );
  });

  it('honours explicit values and leaves unknown tokens untouched', () => {
    const result = personalizeDocument(doc, { name: 'Ana' });
    const columns = result.blocks[2];
    expect(columns?.type === BlockType.Columns && columns.props.columns[1]?.text).toBe(
      'Hola {{missing}}',
    );
  });

  it('returns the original document when there are no variables/values', () => {
    const plain: TemplateDocument = { name: 'X', theme: DEFAULT_THEME, blocks: [] };
    expect(personalizeDocument(plain)).toBe(plain);
  });
});

describe('collectTokenKeys', () => {
  it('collects distinct token keys used across the document', () => {
    expect(collectTokenKeys(doc).sort()).toEqual(['company', 'missing', 'name']);
  });
});
