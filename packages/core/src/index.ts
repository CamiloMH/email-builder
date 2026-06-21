/**
 * `@email/core` — framework-agnostic domain model for the email template
 * builder. Zod schemas are the single source of truth; all TypeScript types are
 * inferred from them. Consumed by both the NestJS API and the Next.js frontend.
 *
 * @packageDocumentation
 */
export * from './common/color.schema';
export * from './common/error-code';
export * from './common/export-format';
export * from './common/id';
export * from './blocks/block.schema';
export * from './blocks/block.catalog';
export * from './blocks/block.factory';
export * from './theme/theme.schema';
export * from './theme/font-catalog';
export * from './template/template.schema';
export * from './template/template.factory';
export * from './personalization/personalize';
export * from './a11y/contrast';
export * from './preflight/preflight';
export * from './examples/example-template';
export * from './examples/examples';
