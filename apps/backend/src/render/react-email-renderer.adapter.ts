import type { TemplateDocument } from '@email/core';
import { renderTemplate, renderTemplateToReactSource, type RenderedEmail } from '@email/emails';
import { Injectable } from '@nestjs/common';
import type { EmailRenderer } from './email-renderer.port';

/**
 * Adapter implementing the {@link EmailRenderer} port using the shared
 * `@email/emails` render engine (react-email).
 */
@Injectable()
export class ReactEmailRendererAdapter implements EmailRenderer {
  /**
   * @inheritdoc
   */
  render(document: TemplateDocument): Promise<RenderedEmail> {
    return renderTemplate(document);
  }

  /**
   * @inheritdoc
   */
  renderToReactSource(document: TemplateDocument): string {
    return renderTemplateToReactSource(document);
  }
}
