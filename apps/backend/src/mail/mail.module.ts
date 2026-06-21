import { Module } from '@nestjs/common';
import { RenderModule } from '../render/render.module';
import { TemplatesModule } from '../templates/templates.module';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { MAILER } from './mailer.port';
import { ResendMailerAdapter } from './resend-mailer.adapter';

/**
 * Module wiring the test-send endpoint: the {@link MAILER} port (Resend adapter),
 * the render engine (via {@link RenderModule}) and stored templates (via
 * {@link TemplatesModule}).
 */
@Module({
  imports: [TemplatesModule, RenderModule],
  controllers: [MailController],
  providers: [MailService, { provide: MAILER, useClass: ResendMailerAdapter }],
})
export class MailModule {}
