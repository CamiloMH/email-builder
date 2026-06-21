import { EXPORT_FORMAT_VALUES, ExportFormat } from '@email/core';
import { BadRequestException, Injectable, type PipeTransform } from '@nestjs/common';

/**
 * Pipe that parses the `format` query parameter into an {@link ExportFormat},
 * defaulting to HTML when absent and rejecting unknown values.
 */
@Injectable()
export class ParseExportFormatPipe implements PipeTransform<unknown, ExportFormat> {
  /**
   * @param value - The raw query value.
   * @returns The validated export format.
   */
  transform(value: unknown): ExportFormat {
    if (value === undefined || value === null || value === '') {
      return ExportFormat.Html;
    }
    if (typeof value === 'string' && (EXPORT_FORMAT_VALUES as readonly string[]).includes(value)) {
      return value as ExportFormat;
    }
    throw new BadRequestException(`Invalid format. Use one of: ${EXPORT_FORMAT_VALUES.join(', ')}`);
  }
}
