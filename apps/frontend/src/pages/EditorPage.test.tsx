import { DEFAULT_THEME, ExportFormat, createDefaultTemplate } from '@email/core';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { templatesApi } from '../api/templates.api';
import type { TemplateResponse } from '../api/types';
import { exportTemplate } from '../lib/export-template';
import { useBuilderStore } from '../store/builder-store';
import { useFavoritesStore } from '../store/favorites-store';
import { renderWithProviders } from '../test/render';
import { EditorPage } from './EditorPage';

vi.mock('@email/emails', () => ({
  renderTemplate: vi.fn().mockResolvedValue({ html: '', text: '' }),
}));
vi.mock('../api/blocks.api', () => ({ blocksApi: { list: vi.fn().mockResolvedValue([]) } }));
vi.mock('../api/templates.api', () => ({
  templatesApi: {
    get: vi.fn(),
    update: vi.fn(),
    list: vi.fn(),
    sendTest: vi.fn(),
  },
}));
vi.mock('../lib/export-template', () => ({ exportTemplate: vi.fn() }));
vi.mock('../lib/download', () => ({ triggerDownload: vi.fn() }));

const templatesApiMock = vi.mocked(templatesApi, true);
const exportTemplateMock = vi.mocked(exportTemplate);

const template: TemplateResponse = {
  id: '123',
  name: 'Mi plantilla',
  theme: DEFAULT_THEME,
  blocks: createDefaultTemplate().blocks,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-02T00:00:00.000Z',
};

const otherTemplate: TemplateResponse = { ...template, id: '456', name: 'Otra plantilla' };

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  useFavoritesStore.setState({ ids: [] });
  templatesApiMock.get.mockResolvedValue(template);
  templatesApiMock.update.mockResolvedValue(template);
  templatesApiMock.list.mockResolvedValue([template, otherTemplate]);
  templatesApiMock.sendTest.mockResolvedValue({ sent: true });
  exportTemplateMock.mockResolvedValue({ blob: new Blob(['x']), filename: 'promo.html' });
});

const renderEditor = (): void => {
  renderWithProviders(
    <Routes>
      <Route path="/:lang/editor/:id" element={<EditorPage />} />
    </Routes>,
    '/es/editor/123',
  );
};

describe('EditorPage', () => {
  it('loads the template into the name field', async () => {
    renderEditor();
    expect(await screen.findByLabelText('Nombre de la plantilla')).toHaveValue('Mi plantilla');
  });

  it('saves the document', async () => {
    renderEditor();
    await screen.findByLabelText('Nombre de la plantilla');
    fireEvent.click(screen.getByRole('button', { name: /Guardar/ }));
    await waitFor(() => expect(templatesApiMock.update).toHaveBeenCalled());
  });

  it('exports via the dropdown (through preflight), toggles preview width, switches tabs and edits the name', async () => {
    renderEditor();
    await screen.findByLabelText('Nombre de la plantilla');

    fireEvent.click(screen.getByRole('button', { name: 'Exportar' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'HTML' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Exportar igual' }));

    fireEvent.click(screen.getByRole('button', { name: 'Exportar' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Componente React' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Exportar igual' }));

    await waitFor(() => expect(exportTemplateMock).toHaveBeenCalledTimes(2));
    expect(exportTemplateMock).toHaveBeenNthCalledWith(1, expect.anything(), ExportFormat.Html);
    expect(exportTemplateMock).toHaveBeenNthCalledWith(2, expect.anything(), ExportFormat.React);

    fireEvent.click(screen.getByRole('button', { name: 'Vista móvil' }));
    fireEvent.click(screen.getByRole('button', { name: 'Vista escritorio' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Tema' }));

    fireEvent.change(screen.getByLabelText('Nombre de la plantilla'), {
      target: { value: 'Renombrada' },
    });
    expect(useBuilderStore.getState().document?.name).toBe('Renombrada');
  });

  it('shows a not-found message when the template fails to load', async () => {
    templatesApiMock.get.mockRejectedValue(new Error('not found'));
    renderEditor();
    expect(await screen.findByText(/No encontramos esta plantilla/)).toBeInTheDocument();
  });

  it('collapses and expands the palette and inspector', async () => {
    renderEditor();
    await screen.findByLabelText('Nombre de la plantilla');

    const collapsePalette = screen.getByRole('button', { name: 'Colapsar panel de bloques' });
    const paletteAside = collapsePalette.closest('aside') as HTMLElement;
    fireEvent.click(collapsePalette);
    expect(paletteAside.className).toContain('lg:hidden');
    fireEvent.click(screen.getByRole('button', { name: 'Expandir panel de bloques' }));
    expect(paletteAside.className).not.toContain('lg:hidden');

    const collapseInspector = screen.getByRole('button', { name: 'Colapsar inspector' });
    const inspectorAside = collapseInspector.closest('aside') as HTMLElement;
    fireEvent.click(collapseInspector);
    expect(inspectorAside.className).toContain('lg:hidden');
    fireEvent.click(screen.getByRole('button', { name: 'Expandir inspector' }));
    expect(inspectorAside.className).not.toContain('lg:hidden');
  });

  it('switches to another template via the selector', async () => {
    renderEditor();
    await screen.findByLabelText('Nombre de la plantilla');
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar de plantilla' }));
    fireEvent.click(screen.getByRole('button', { name: 'Otra plantilla' }));
    await waitFor(() => expect(templatesApiMock.get).toHaveBeenCalledWith('456'));
  });

  it('toggles the current template as favorite', async () => {
    renderEditor();
    await screen.findByLabelText('Nombre de la plantilla');
    fireEvent.click(screen.getByRole('button', { name: 'Marcar como favorito' }));
    expect(useFavoritesStore.getState().isFavorite('123')).toBe(true);
    expect(screen.getByRole('button', { name: 'Quitar de favoritos' })).toBeInTheDocument();
  });

  it('runs a preflight check from the toolbar and shows the score', async () => {
    renderEditor();
    await screen.findByLabelText('Nombre de la plantilla');
    fireEvent.click(screen.getByRole('button', { name: 'Revisar' }));
    expect(await screen.findByText(/Puntuación:/)).toBeInTheDocument();
  });

  it('sends a test email through the modal', async () => {
    renderEditor();
    await screen.findByLabelText('Nombre de la plantilla');
    fireEvent.click(screen.getByRole('button', { name: 'Enviar prueba' }));
    fireEvent.change(screen.getByLabelText('Correo de destino'), {
      target: { value: 'tester@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }));
    await waitFor(() =>
      expect(templatesApiMock.sendTest).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'tester@example.com' }),
      ),
    );
  });

  it('adds a personalization variable from the Variables tab', async () => {
    renderEditor();
    await screen.findByLabelText('Nombre de la plantilla');
    fireEvent.click(screen.getByRole('tab', { name: 'Variables' }));
    fireEvent.click(screen.getByRole('button', { name: 'Añadir variable' }));
    expect(useBuilderStore.getState().document?.variables).toHaveLength(1);
  });

  it('persists the preview device preference', async () => {
    renderEditor();
    await screen.findByLabelText('Nombre de la plantilla');
    fireEvent.click(screen.getByRole('button', { name: 'Vista móvil' }));
    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem('email-builder-editor-prefs') ?? '{}');
      expect(stored.previewWidth).toBe(375);
    });
  });
});
