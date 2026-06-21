import { personalizeDocument } from '@email/core';
import { renderTemplate } from '@email/emails';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useDebouncedValue } from '../../lib/use-debounced-value';
import { useBuilderStore } from '../../store/builder-store';
import { useImageErrorsStore } from '../../store/image-errors-store';
import { applyColorHighlight } from './color-highlight';
import { stripBrokenImages } from './strip-broken-images';

const PREVIEW_DEBOUNCE_MS = 300;

interface PreviewPaneProps {
  /** The preview viewport width in pixels. */
  width: number;
}

/**
 * Live email preview. Re-renders the (debounced) document with the shared
 * `renderTemplate` engine and shows the result in a sandboxed iframe, so it is
 * byte-for-byte identical to the exported HTML. While a theme color is hovered,
 * the elements that use it are outlined.
 */
export const PreviewPane = ({ width }: PreviewPaneProps): ReactNode => {
  const document = useBuilderStore((state) => state.document);
  const highlightColor = useBuilderStore((state) => state.highlightColor);
  const brokenImages = useImageErrorsStore((state) => state.broken);
  const debouncedDocument = useDebouncedValue(document, PREVIEW_DEBOUNCE_MS);
  const [html, setHtml] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    let active = true;
    if (!debouncedDocument) {
      setHtml('');
      return;
    }
    // Substitute merge-tag sample values and drop broken images so the preview
    // looks like a real send without showing failed/missing images.
    const document = stripBrokenImages(personalizeDocument(debouncedDocument), brokenImages);
    void renderTemplate(document)
      .then((result) => {
        if (active) {
          setHtml(result.html);
        }
      })
      .catch(() => {
        if (active) {
          setHtml('<p>No se pudo generar la vista previa.</p>');
        }
      });
    return () => {
      active = false;
    };
  }, [debouncedDocument, brokenImages]);

  useEffect(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc || !highlightColor) {
      return;
    }
    return applyColorHighlight(doc, highlightColor);
  }, [highlightColor, html]);

  return (
    <div className="flex h-full justify-center overflow-auto bg-gray-100 p-4 sm:p-6">
      <iframe
        ref={iframeRef}
        title="Vista previa del email"
        srcDoc={html}
        className="h-full shrink-0 rounded-lg border border-gray-200 bg-white shadow-sm"
        style={{ width }}
      />
    </div>
  );
};
