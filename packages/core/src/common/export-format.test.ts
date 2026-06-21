import { describe, expect, it } from 'vitest';
import { EXPORT_EXTENSION, EXPORT_FORMAT_VALUES, ExportFormat } from './export-format';

describe('ExportFormat', () => {
  it('exposes the supported formats', () => {
    expect(ExportFormat.Html).toBe('html');
    expect(ExportFormat.Text).toBe('text');
    expect(ExportFormat.React).toBe('react');
    expect(ExportFormat.Hbs).toBe('hbs');
    expect(ExportFormat.Eml).toBe('eml');
    expect(ExportFormat.Json).toBe('json');
  });

  it('lists every format value', () => {
    expect([...EXPORT_FORMAT_VALUES]).toEqual([
      ExportFormat.Html,
      ExportFormat.Text,
      ExportFormat.React,
      ExportFormat.Hbs,
      ExportFormat.Eml,
      ExportFormat.Json,
    ]);
  });

  it('maps every format to a file extension', () => {
    expect(EXPORT_EXTENSION[ExportFormat.Html]).toBe('html');
    expect(EXPORT_EXTENSION[ExportFormat.Text]).toBe('txt');
    expect(EXPORT_EXTENSION[ExportFormat.React]).toBe('tsx');
    expect(EXPORT_EXTENSION[ExportFormat.Hbs]).toBe('hbs');
    expect(EXPORT_EXTENSION[ExportFormat.Eml]).toBe('eml');
    expect(EXPORT_EXTENSION[ExportFormat.Json]).toBe('json');
  });
});
