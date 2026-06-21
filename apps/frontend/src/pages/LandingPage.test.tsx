import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../test/render';
import { LandingPage } from './LandingPage';

describe('LandingPage', () => {
  it('renders the hero and links to the editor', () => {
    renderWithProviders(<LandingPage />, '/es');
    expect(screen.getByRole('heading', { name: /Diseña emails/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ir al editor/ })).toHaveAttribute('href', '/es/app');
  });

  it('shows the features and steps', () => {
    renderWithProviders(<LandingPage />, '/es');
    expect(screen.getByText('Constructor por bloques')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Cómo funciona' })).toBeInTheDocument();
    expect(screen.getByText('Paso 1')).toBeInTheDocument();
    expect(screen.getByText('Paso 4')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Crear mi primer email/ })).toHaveAttribute(
      'href',
      '/es/app',
    );
  });
});
