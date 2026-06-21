import { describe, expect, it } from 'vitest';
import { HIGHLIGHT_CLASS, applyColorHighlight } from './color-highlight';

describe('applyColorHighlight', () => {
  it('highlights elements that use the color (case-insensitive) and cleans up', () => {
    const doc = document.implementation.createHTMLDocument('preview');
    const match = doc.createElement('div');
    match.setAttribute('style', 'background-color:#2563EB');
    const other = doc.createElement('div');
    other.setAttribute('style', 'color:#111827');
    doc.body.append(match, other);

    const cleanup = applyColorHighlight(doc, '#2563eb');
    expect(match.classList.contains(HIGHLIGHT_CLASS)).toBe(true);
    expect(other.classList.contains(HIGHLIGHT_CLASS)).toBe(false);

    cleanup();
    expect(match.classList.contains(HIGHLIGHT_CLASS)).toBe(false);
  });

  it('matches nothing when no element uses the color', () => {
    const doc = document.implementation.createHTMLDocument('preview');
    const element = doc.createElement('div');
    element.setAttribute('style', 'color:#000000');
    doc.body.append(element);

    applyColorHighlight(doc, '#abcdef');
    expect(element.classList.contains(HIGHLIGHT_CLASS)).toBe(false);
  });

  it('keeps highlighting across repeated hovers without mutating inline styles', () => {
    const doc = document.implementation.createHTMLDocument('preview');
    const match = doc.createElement('div');
    match.setAttribute('style', 'color:#111827');
    doc.body.append(match);

    const first = applyColorHighlight(doc, '#111827');
    expect(match.classList.contains(HIGHLIGHT_CLASS)).toBe(true);
    first();

    // The inline style must remain the original hex (not re-serialized to rgb),
    // otherwise the next hover would fail to match.
    expect(match.getAttribute('style')).toBe('color:#111827');

    const second = applyColorHighlight(doc, '#111827');
    expect(match.classList.contains(HIGHLIGHT_CLASS)).toBe(true);
    second();
  });

  it('injects the highlight stylesheet only once', () => {
    const doc = document.implementation.createHTMLDocument('preview');
    applyColorHighlight(doc, '#000000');
    applyColorHighlight(doc, '#ffffff');
    expect(doc.querySelectorAll('style').length).toBe(1);
  });
});
