import { Align } from '@email/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  Button,
  ButtonVariant,
  Field,
  IconButton,
  RangeSlider,
  SegmentedControl,
  Select,
  TextArea,
  TextInput,
} from './controls';

describe('Button', () => {
  it('renders a button of type button by default and handles clicks', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    const button = screen.getByRole('button', { name: 'Click' });
    expect(button).toHaveAttribute('type', 'button');
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalled();
  });

  it('applies the danger variant styles', () => {
    render(<Button variant={ButtonVariant.Danger}>Borrar</Button>);
    expect(screen.getByRole('button', { name: 'Borrar' }).className).toContain('bg-red-600');
  });

  it('shows a spinner, disables itself and ignores clicks while loading', () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} loading>
        Guardar
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Guardar' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button.querySelector('svg.animate-spin')).toBeInTheDocument();
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('is not busy when not loading', () => {
    render(<Button>Guardar</Button>);
    const button = screen.getByRole('button', { name: 'Guardar' });
    expect(button).not.toHaveAttribute('aria-busy');
    expect(button.querySelector('svg.animate-spin')).not.toBeInTheDocument();
  });
});

describe('IconButton', () => {
  it('exposes its label as an accessible name', () => {
    render(<IconButton label="Eliminar">x</IconButton>);
    expect(screen.getByRole('button', { name: 'Eliminar' })).toBeInTheDocument();
  });
});

describe('Field', () => {
  it('renders the label and its control', () => {
    render(
      <Field label="Nombre">
        <TextInput defaultValue="hola" />
      </Field>,
    );
    expect(screen.getByText('Nombre')).toBeInTheDocument();
  });
});

describe('TextInput / TextArea / Select', () => {
  it('forwards changes', () => {
    const onChange = vi.fn();
    render(<TextInput value="" onChange={onChange} aria-label="campo" />);
    fireEvent.change(screen.getByLabelText('campo'), { target: { value: 'x' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('renders a textarea and a select', () => {
    render(
      <>
        <TextArea aria-label="area" defaultValue="texto" />
        <Select aria-label="sel" defaultValue="a">
          <option value="a">A</option>
        </Select>
      </>,
    );
    expect(screen.getByLabelText('area')).toBeInTheDocument();
    expect(screen.getByLabelText('sel')).toBeInTheDocument();
  });
});

describe('RangeSlider', () => {
  it('emits numeric values', () => {
    const onChange = vi.fn();
    render(<RangeSlider value={10} min={0} max={20} onChange={onChange} />);
    fireEvent.change(screen.getByRole('slider'), { target: { value: '15' } });
    expect(onChange).toHaveBeenCalledWith(15);
  });
});

describe('SegmentedControl', () => {
  it('marks the active option and emits changes', () => {
    const onChange = vi.fn();
    render(<SegmentedControl value={Align.Left} onChange={onChange} />);
    const center = screen.getByRole('button', { name: 'Centro' });
    expect(screen.getByRole('button', { name: 'Izquierda' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    fireEvent.click(center);
    expect(onChange).toHaveBeenCalledWith(Align.Center);
  });
});
