import { DEFAULT_THEME } from '@email/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import type { TemplateResponse } from '../../api/types';
import { TemplateSwitcher } from './TemplateSwitcher';

const template = (id: string, name: string): TemplateResponse => ({
  id,
  name,
  theme: DEFAULT_THEME,
  blocks: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
});

const renderSwitcher = (favoriteIds: string[] = []): void => {
  render(
    <MemoryRouter initialEntries={['/start']}>
      <Routes>
        <Route
          path="/start"
          element={
            <TemplateSwitcher
              currentId="1"
              templates={[template('1', 'Uno'), template('2', 'Dos')]}
              favoriteIds={favoriteIds}
            />
          }
        />
        <Route path="/es/editor/2" element={<div>Editor 2</div>} />
      </Routes>
    </MemoryRouter>,
  );
};

describe('TemplateSwitcher', () => {
  it('shows the current template and navigates on selection', async () => {
    renderSwitcher(['1']);
    expect(screen.getByRole('button', { name: 'Cambiar de plantilla' })).toHaveTextContent('Uno');

    fireEvent.click(screen.getByRole('button', { name: 'Cambiar de plantilla' }));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dos' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Dos' }));
    expect(await screen.findByText('Editor 2')).toBeInTheDocument();
  });

  it('closes on Escape and on outside click', () => {
    renderSwitcher();
    const trigger = screen.getByRole('button', { name: 'Cambiar de plantilla' });

    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    fireEvent.click(trigger);
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
