import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { templatesApi } from './api/templates.api';
import { App } from './App';
import { renderWithProviders } from './test/render';

vi.mock('./api/templates.api', () => ({
  templatesApi: { list: vi.fn().mockResolvedValue([]) },
}));

beforeEach(() => {
  vi.mocked(templatesApi.list).mockResolvedValue([]);
});

describe('App', () => {
  it('renders the landing page on the /es index route', () => {
    renderWithProviders(<App />, '/es');
    expect(screen.getByRole('heading', { name: /Diseña emails/ })).toBeInTheDocument();
  });

  it('renders the dashboard on the /es/app route', async () => {
    renderWithProviders(<App />, '/es/app');
    expect(await screen.findByText('Mis plantillas')).toBeInTheDocument();
  });

  it('redirects an unprefixed path to the default language', async () => {
    renderWithProviders(<App />, '/');
    expect(await screen.findByRole('heading', { name: /Diseña emails/ })).toBeInTheDocument();
  });
});
