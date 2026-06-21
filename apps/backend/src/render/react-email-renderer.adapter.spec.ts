import { createDefaultTemplate } from '@email/core';
import { renderTemplate, renderTemplateToReactSource } from '@email/emails';
import { ReactEmailRendererAdapter } from './react-email-renderer.adapter';

jest.mock('@email/emails', () => ({
  renderTemplate: jest.fn().mockResolvedValue({ html: '<html></html>', text: 'text' }),
  renderTemplateToReactSource: jest.fn().mockReturnValue('export default Email;'),
}));

describe('ReactEmailRendererAdapter', () => {
  it('delegates rendering to the shared renderTemplate engine', async () => {
    const adapter = new ReactEmailRendererAdapter();
    const document = createDefaultTemplate();

    const result = await adapter.render(document);

    expect(renderTemplate).toHaveBeenCalledWith(document);
    expect(result).toEqual({ html: '<html></html>', text: 'text' });
  });

  it('delegates React-component export to renderTemplateToReactSource', () => {
    const adapter = new ReactEmailRendererAdapter();
    const document = createDefaultTemplate();

    const result = adapter.renderToReactSource(document);

    expect(renderTemplateToReactSource).toHaveBeenCalledWith(document);
    expect(result).toBe('export default Email;');
  });
});
