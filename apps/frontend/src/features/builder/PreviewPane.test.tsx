import { renderTemplate } from '@email/emails';
import { createDefaultTemplate } from '@email/core';
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useBuilderStore } from '../../store/builder-store';
import { PreviewPane } from './PreviewPane';

vi.mock('@email/emails', () => ({
  renderTemplate: vi.fn(),
}));

const renderTemplateMock = vi.mocked(renderTemplate);

beforeEach(() => {
  useBuilderStore.getState().setDocument(createDefaultTemplate());
});

afterEach(() => {
  renderTemplateMock.mockReset();
});

describe('PreviewPane', () => {
  it('renders the produced HTML into the iframe', async () => {
    renderTemplateMock.mockResolvedValue({ html: '<p>preview</p>', text: 'preview' });
    render(<PreviewPane width={600} />);
    const iframe = screen.getByTitle('Vista previa del email');
    await waitFor(() => {
      expect(iframe.getAttribute('srcdoc')).toContain('preview');
    });
  });

  it('shows a fallback message when rendering fails', async () => {
    renderTemplateMock.mockRejectedValue(new Error('boom'));
    render(<PreviewPane width={600} />);
    const iframe = screen.getByTitle('Vista previa del email');
    await waitFor(() => {
      expect(iframe.getAttribute('srcdoc')).toContain('No se pudo');
    });
  });

  it('renders an empty iframe when there is no document', () => {
    useBuilderStore.getState().reset();
    render(<PreviewPane width={600} />);
    expect(screen.getByTitle('Vista previa del email').getAttribute('srcdoc')).toBe('');
  });

  it('renders without crashing when a highlight color is active', async () => {
    renderTemplateMock.mockResolvedValue({ html: '<p>x</p>', text: 'x' });
    useBuilderStore.getState().setHighlightColor('#2563EB');
    render(<PreviewPane width={375} />);
    await screen.findByTitle('Vista previa del email');
    useBuilderStore.getState().setHighlightColor(null);
  });
});
