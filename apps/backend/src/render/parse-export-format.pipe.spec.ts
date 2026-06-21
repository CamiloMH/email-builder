import { ExportFormat } from '@email/core';
import { BadRequestException } from '@nestjs/common';
import { ParseExportFormatPipe } from './parse-export-format.pipe';

describe('ParseExportFormatPipe', () => {
  const pipe = new ParseExportFormatPipe();

  it('defaults to HTML when no value is provided', () => {
    expect(pipe.transform(undefined)).toBe(ExportFormat.Html);
    expect(pipe.transform('')).toBe(ExportFormat.Html);
  });

  it('accepts known formats', () => {
    expect(pipe.transform('html')).toBe(ExportFormat.Html);
    expect(pipe.transform('text')).toBe(ExportFormat.Text);
    expect(pipe.transform('react')).toBe(ExportFormat.React);
  });

  it('rejects unknown or non-string values', () => {
    expect(() => pipe.transform('pdf')).toThrow(BadRequestException);
    expect(() => pipe.transform(123)).toThrow(BadRequestException);
  });
});
