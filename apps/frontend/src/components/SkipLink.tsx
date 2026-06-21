import type { ReactNode } from 'react';

/** Target id that {@link SkipLink} jumps to. Set it on the page's main region. */
export const MAIN_CONTENT_ID = 'contenido';

/**
 * "Skip to content" link: visually hidden until focused, letting keyboard users
 * bypass navigation (WCAG 2.4.1).
 */
export const SkipLink = (): ReactNode => (
  <a href={`#${MAIN_CONTENT_ID}`} className="sr-only sr-only-focusable">
    Saltar al contenido
  </a>
);
