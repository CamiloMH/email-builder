import type { TemplateDocument } from '../template/template.schema';

/**
 * Enum-like `const` of the industries covered by the example gallery.
 */
export const ExampleSector = {
  Ecommerce: 'ecommerce',
  Saas: 'saas',
  Newsletter: 'newsletter',
  Restaurant: 'restaurant',
  Health: 'health',
  Event: 'event',
} as const;

/**
 * An industry covered by an example template.
 */
export type ExampleSector = (typeof ExampleSector)[keyof typeof ExampleSector];

/**
 * Human-readable labels for each {@link ExampleSector}.
 */
export const SECTOR_LABELS: Record<ExampleSector, string> = {
  [ExampleSector.Ecommerce]: 'E-commerce',
  [ExampleSector.Saas]: 'SaaS',
  [ExampleSector.Newsletter]: 'Newsletter',
  [ExampleSector.Restaurant]: 'Restaurante',
  [ExampleSector.Health]: 'Salud',
  [ExampleSector.Event]: 'Eventos',
};

/**
 * A curated, professional starter template the user can preview and copy.
 */
export interface ExampleTemplate {
  /** Stable identifier for the example. */
  id: string;
  /** Display name. */
  name: string;
  /** The industry this example targets. */
  sector: ExampleSector;
  /** One-line description shown on the gallery card. */
  description: string;
  /** Brand accent color, so the gallery card can be themed without rendering. */
  accentColor: string;
  /**
   * Builds a fresh {@link TemplateDocument} (with new block ids on each call) so
   * every copy is independent.
   *
   * @returns The example's template document.
   */
  build: () => TemplateDocument;
}
