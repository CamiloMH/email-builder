import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ColorField } from './ColorField';

describe('ColorField', () => {
  it('toggles the picker and emits hex changes via the input', () => {
    const onChange = vi.fn();
    render(<ColorField label="Primario" value="#2563EB" onChange={onChange} />);

    // Picker hidden initially.
    expect(screen.queryByLabelText('Hex Primario')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cambiar color Primario' }));
    const hexInput = screen.getByLabelText('Hex Primario');
    fireEvent.change(hexInput, { target: { value: '#000000' } });
    expect(onChange).toHaveBeenCalledWith('#000000');

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(screen.queryByLabelText('Hex Primario')).not.toBeInTheDocument();
  });
});
