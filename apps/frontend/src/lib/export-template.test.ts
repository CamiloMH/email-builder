import { ExportFormat, createDefaultTemplate } from '@email/core';
import { describe, expect, it, vi } from 'vitest';
import { exportTemplate } from './export-template';

vi.mock('@email/emails', () => ({
  renderTemplate: vi.fn().mockResolvedValue({ html: '<p>hi</p>', text: 'hi' }),
  renderTemplateToReactSource: vi.fn().mockReturnValue('export const Email = () => null;'),
}));

// jsdom's Blob lacks `.text()`, so read it via FileReader.
function readBlob(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}

const doc = { ...createDefaultTemplate(), name: 'My Promo' };

describe('exportTemplate', () => {
  it('exports HTML with a slugged filename', async () => {
    const file = await exportTemplate(doc, ExportFormat.Html);
    expect(file.filename).toBe('my-promo.html');
    expect(await readBlob(file.blob)).toContain('<p>hi</p>');
  });

  it('exports plain text', async () => {
    const file = await exportTemplate(doc, ExportFormat.Text);
    expect(file.filename).toBe('my-promo.txt');
    expect(await readBlob(file.blob)).toBe('hi');
  });

  it('exports a React component source', async () => {
    const file = await exportTemplate(doc, ExportFormat.React);
    expect(file.filename).toBe('my-promo.tsx');
    expect(await readBlob(file.blob)).toContain('export const Email');
  });

  it('exports an .eml multipart message', async () => {
    const file = await exportTemplate(doc, ExportFormat.Eml);
    expect(file.filename).toBe('my-promo.eml');
    const content = await readBlob(file.blob);
    expect(content).toContain('multipart/alternative');
    expect(content).toContain('<p>hi</p>');
  });

  it('exports raw JSON without rendering', async () => {
    const file = await exportTemplate(doc, ExportFormat.Json);
    expect(file.filename).toBe('my-promo.json');
    expect((JSON.parse(await readBlob(file.blob)) as { name: string }).name).toBe('My Promo');
  });
});
