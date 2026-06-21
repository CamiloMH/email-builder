import { createDefaultTemplate } from '@email/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useBuilderStore } from '../../store/builder-store';
import { VariablesPanel } from './VariablesPanel';

const variables = () => useBuilderStore.getState().document?.variables ?? [];

beforeEach(() => {
  useBuilderStore.getState().setDocument(createDefaultTemplate());
});

describe('VariablesPanel', () => {
  it('adds, edits (sanitizing the key) and removes a variable', () => {
    render(<VariablesPanel />);
    expect(screen.getByText(/Aún no hay variables/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Añadir variable' }));
    expect(variables()).toHaveLength(1);

    fireEvent.change(screen.getByLabelText('Clave'), { target: { value: 'first name!' } });
    expect(variables()[0]?.key).toBe('firstname');

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar variable' }));
    expect(variables()).toHaveLength(0);
  });
});
