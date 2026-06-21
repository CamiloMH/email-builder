import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DropdownMenu, type DropdownMenuItem } from './DropdownMenu';

const buildItems = (onSelect = vi.fn()): { items: DropdownMenuItem[]; onSelect: typeof onSelect } => ({
  onSelect,
  items: [
    { id: 'a', label: 'Opción A', onSelect },
    { id: 'b', label: 'Opción B', onSelect: vi.fn() },
  ],
});

describe('DropdownMenu', () => {
  it('is closed initially and opens on trigger click', () => {
    const { items } = buildItems();
    render(<DropdownMenu ariaLabel="Acciones" trigger="Acciones" items={items} />);

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Acciones' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Opción A' })).toBeInTheDocument();
  });

  it('invokes the item handler and closes after a selection', () => {
    const { items, onSelect } = buildItems();
    render(<DropdownMenu ariaLabel="Acciones" trigger="Acciones" items={items} />);

    fireEvent.click(screen.getByRole('button', { name: 'Acciones' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Opción A' }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes on Escape and on outside click', () => {
    const { items } = buildItems();
    render(<DropdownMenu ariaLabel="Acciones" trigger="Acciones" items={items} />);
    const trigger = screen.getByRole('button', { name: 'Acciones' });

    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    fireEvent.click(trigger);
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
