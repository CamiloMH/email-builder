import { ExportFormat } from '@email/core';
import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, Res } from '@nestjs/common';
import { ApiOkResponse, ApiProduces, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { CurrentOwner } from '../common/owner/current-owner.decorator';
import { RenderTemplateDto } from './dto/render-template.dto';
import { RenderedEmailResponseDto } from './dto/rendered-email.dto';
import { ParseExportFormatPipe } from './parse-export-format.pipe';
import { RENDER_THROTTLE_LIMIT, RENDER_THROTTLE_TTL } from './render.constants';
import { RenderService } from './render.service';

/**
 * REST controller for rendering and exporting templates.
 */
@ApiTags('render')
@Controller()
export class RenderController {
  /**
   * @param renderService - The render application service.
   */
  constructor(private readonly renderService: RenderService) {}

  /**
   * Renders an ad-hoc template document to HTML + text (used by the live
   * preview). Rate-limited more strictly than other endpoints.
   *
   * @param dto - The template document to render.
   * @returns The rendered email.
   */
  @Post('render')
  @Throttle({ default: { ttl: RENDER_THROTTLE_TTL, limit: RENDER_THROTTLE_LIMIT } })
  @ApiOkResponse({ type: RenderedEmailResponseDto })
  render(@Body() dto: RenderTemplateDto): Promise<RenderedEmailResponseDto> {
    return this.renderService.renderDocument(dto);
  }

  /**
   * Exports a stored, owned template as a downloadable HTML or text file.
   *
   * @param id - The template id.
   * @param format - The export format (`html` or `text`, defaults to `html`).
   * @param ownerKey - The resolved owner key.
   * @param response - The Express response used to stream the file.
   */
  @Get('templates/:id/export')
  @ApiProduces('text/html', 'text/plain')
  @ApiQuery({ name: 'format', enum: ExportFormat, required: false })
  async export(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('format', ParseExportFormatPipe) format: ExportFormat,
    @CurrentOwner() ownerKey: string,
    @Res() response: Response,
  ): Promise<void> {
    const exported = await this.renderService.exportTemplate(id, ownerKey, format);
    response.setHeader('Content-Type', exported.contentType);
    response.setHeader('Content-Disposition', `attachment; filename="${exported.filename}"`);
    response.send(exported.content);
  }
}
