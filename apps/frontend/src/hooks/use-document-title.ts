import { useEffect } from 'react';

/**
 * Sets the document title for the current view (helps SEO/sharing and orients
 * screen-reader users on route changes).
 *
 * @param title - The title to apply while the component is mounted.
 */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
