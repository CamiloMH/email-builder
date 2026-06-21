import { DEFAULT_THEME } from '@email/core';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { templatesApi } from '../api/templates.api';
import type { TemplateResponse } from '../api/types';
import { useFavoritesStore } from '../store/favorites-store';
import { renderWithProviders } from '../test/render';
import { DashboardPage } from './DashboardPage';

vi.mock('../api/templates.api', () => ({
  templatesApi: {
    list: vi.fn(),
    create: vi.fn(),
    remove: vi.fn(),
  },
}));

const templatesApiMock = vi.mocked(templatesApi, true);

const makeTemplate = (id: string, name: string): TemplateResponse => ({
  id,
  name,
  theme: DEFAULT_THEME,
  blocks: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-02T00:00:00.000Z',
});

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  useFavoritesStore.setState({ ids: [] });
});

describe('DashboardPage', () => {
  it('lists the visitor templates', async () => {
    templatesApiMock.list.mockResolvedValue([
      makeTemplate('1', 'Alpha'),
      makeTemplate('2', 'Beta'),
    ]);
    renderWithProviders(<DashboardPage />);
    expect(await screen.findByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('shows the empty state and creates a template', async () => {
    templatesApiMock.list.mockResolvedValue([]);
    templatesApiMock.create.mockResolvedValue(makeTemplate('new', 'Nueva'));
    renderWithProviders(<DashboardPage />);
    fireEvent.click(await screen.findByRole('button', { name: /Nueva plantilla/ }));
    await waitFor(() => expect(templatesApiMock.create).toHaveBeenCalled());
  });

  it('deletes a template', async () => {
    templatesApiMock.list.mockResolvedValue([makeTemplate('1', 'Alpha')]);
    templatesApiMock.remove.mockResolvedValue(undefined);
    renderWithProviders(<DashboardPage />);
    await screen.findByText('Alpha');
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar plantilla' }));
    await waitFor(() => expect(templatesApiMock.remove).toHaveBeenCalledWith('1'));
  });

  it('navigates to the editor when a template is opened', async () => {
    templatesApiMock.list.mockResolvedValue([makeTemplate('1', 'Alpha')]);
    renderWithProviders(
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/es/editor/:id" element={<div>Editor de 1</div>} />
      </Routes>,
      '/',
    );
    fireEvent.click(await screen.findByText('Alpha'));
    expect(await screen.findByText('Editor de 1')).toBeInTheDocument();
  });

  it('marks a template as favorite and lists it first', async () => {
    templatesApiMock.list.mockResolvedValue([makeTemplate('1', 'Alpha'), makeTemplate('2', 'Beta')]);
    renderWithProviders(<DashboardPage />);
    await screen.findByText('Alpha');

    fireEvent.click(screen.getAllByRole('button', { name: 'Marcar como favorito' })[1] as HTMLElement);
    expect(useFavoritesStore.getState().isFavorite('2')).toBe(true);

    const headings = screen.getAllByRole('heading', { level: 2 });
    expect(headings[0]).toHaveTextContent('Beta');
  });
});
