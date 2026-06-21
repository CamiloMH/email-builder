/** Class applied to preview elements that use the hovered color. */
export const HIGHLIGHT_CLASS = '__color-highlight';

/** Id of the injected stylesheet that defines the highlight outline. */
const HIGHLIGHT_STYLE_ID = '__color-highlight-style';

/** CSS rule injected once per preview document. */
const HIGHLIGHT_RULE = `.${HIGHLIGHT_CLASS}{outline:2px solid #f59e0b !important;outline-offset:2px !important;}`;

/**
 * Ensures the highlight stylesheet exists in `doc` (idempotent).
 *
 * @param doc - The preview document.
 */
function ensureStyle(doc: Document): void {
  if (doc.getElementById(HIGHLIGHT_STYLE_ID)) {
    return;
  }
  const style = doc.createElement('style');
  style.id = HIGHLIGHT_STYLE_ID;
  style.textContent = HIGHLIGHT_RULE;
  (doc.head ?? doc.body ?? doc.documentElement).appendChild(style);
}

/**
 * Outlines every element in `doc` whose inline style references `color`
 * (case-insensitive), so hovering a theme color reveals the elements it affects
 * in the live preview.
 *
 * The outline is applied via a CSS class plus an injected stylesheet rather than
 * by mutating each element's inline `style`: touching `element.style` makes the
 * browser re-serialize the whole `style` attribute, normalising authored hex
 * colors to `rgb(...)`. That broke matching on the second hover onwards, since
 * the hex needle no longer appeared in the attribute. Using a class leaves the
 * inline styles untouched, so highlighting works on every hover.
 *
 * @param doc - The (same-origin) preview document.
 * @param color - The hex color to look for in inline styles.
 * @returns A cleanup function that removes the highlight from matched elements.
 */
export function applyColorHighlight(doc: Document, color: string): () => void {
  ensureStyle(doc);
  const needle = color.toLowerCase();
  const matched: HTMLElement[] = [];

  doc.querySelectorAll<HTMLElement>('[style]').forEach((element) => {
    const style = element.getAttribute('style')?.toLowerCase() ?? '';
    if (style.includes(needle)) {
      element.classList.add(HIGHLIGHT_CLASS);
      matched.push(element);
    }
  });

  return () => {
    for (const element of matched) {
      element.classList.remove(HIGHLIGHT_CLASS);
    }
  };
}
