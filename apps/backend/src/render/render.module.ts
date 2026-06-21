import { Module } from '@nestjs/common';
import { TemplatesModule } from '../templates/templates.module';
import { EMAIL_RENDERER } from './email-renderer.port';
import { ReactEmailRendererAdapter } from './react-email-renderer.adapter';
import { RenderController } from './render.controller';
import { RenderService } from './render.service';

/**
 * Module wiring the render engine (via the {@link EMAIL_RENDERER} port) and the
 * render/export endpoints. Imports {@link TemplatesModule} to load stored
 * templates for export.
 */
@Module({
  imports: [TemplatesModule],
  controllers: [RenderController],
  providers: [RenderService, { provide: EMAIL_RENDERER, useClass: ReactEmailRendererAdapter }],
  exports: [EMAIL_RENDERER],
})
export class RenderModule {}
