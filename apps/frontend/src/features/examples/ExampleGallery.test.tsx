import { DEFAULT_THEME } from '@email/core';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { templatesApi } from '../../api/templates.api';
import { Language, setLanguage } from '../../i18n';
import { renderWithProviders } from '../../test/render';
import { ExampleGallery } from './ExampleGallery';

vi.mock('@email/emails', () => ({
  renderTemplate: vi.fn().mockResolvedValue({ html: '<p>preview</p>', text: 'preview' }),
}));
vi.mock('../../api/templates.api', () => ({
  templatesApi: { create: vi.fn(), list: vi.fn().mockResolvedValue([]) },
}));

const templatesApiMock = vi.mocked(templatesApi, true);

const renderGallery = (): void => {
  renderWithProviders(
    <Routes>
      <Route path="/:lang" element={<ExampleGallery />} />
      <Route path="/:lang/editor/:id" element={<div>Editor abierto</div>} />
    </Routes>,
    '/es',
  );
};

afterEach(() => setLanguage(Language.Es));

beforeEach(() => {
  vi.clearAllMocks();
  templatesApiMock.create.mockResolvedValue({
    id: 'new-id',
    name: 'x',
    theme: DEFAULT_THEME,
    blocks: [],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  });
});

describe('ExampleGallery', () => {
  it('lists curated examples', () => {
    renderGallery();
    expect(screen.getByRole('heading', { name: 'Empieza con un ejemplo' })).toBeInTheDocument();
    expect(screen.getByText('Oferta de e-commerce')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Usar plantilla' }).length).toBeGreaterThanOrEqual(
      6,
    );
  });

  it('copies an example and opens the editor', async () => {
    renderGallery();
    fireEvent.click(screen.getAllByRole('button', { name: 'Usar plantilla' })[0] as HTMLElement);
    await waitFor(() => expect(templatesApiMock.create).toHaveBeenCalled());
    expect(await screen.findByText('Editor abierto')).toBeInTheDocument();
  });

  it('translates the gallery and cards to English', () => {
    setLanguage(Language.En);
    renderGallery();
    expect(screen.getByRole('heading', { name: 'Start from an example' })).toBeInTheDocument();
    expect(screen.getByText('E-commerce sale')).toBeInTheDocument();
    expect(
      screen.getAllByRole('button', { name: 'Use template' }).length,
    ).toBeGreaterThanOrEqual(6);
  });

  it('previews an example in a modal and copies it from there', async () => {
    renderGallery();
    fireEvent.click(screen.getAllByRole('button', { name: 'Vista previa' })[0] as HTMLElement);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByTitle('Vista previa del ejemplo')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Usar esta plantilla' }));
    await waitFor(() => expect(templatesApiMock.create).toHaveBeenCalled());
  });
});
