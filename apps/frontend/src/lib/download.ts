/**
 * Triggers a browser download of a blob by clicking a temporary anchor.
 *
 * @param blob - The file contents.
 * @param filename - The suggested filename.
 */
export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
