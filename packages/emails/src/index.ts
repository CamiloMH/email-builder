/**
 * `@email/emails` — react-email components and the render engine that turns a
 * {@link TemplateDocument} into HTML and plain text. Implements the Strategy
 * (per-block rendering), Factory (strategy selection) and Builder (document
 * assembly) patterns. Shared by the frontend preview and the backend export.
 *
 * @packageDocumentation
 */
export * from './blocks/block-render-strategy';
export * from './blocks/block-strategy.factory';
export * from './builder/email-document.builder';
export * from './codegen/react-source.builder';
export * from './render/render-template';
export * from './theme/head-style';
export * from './theme/theme-style';
