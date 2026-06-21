import { createDefaultTemplate, DEFAULT_THEME } from '@email/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useBuilderStore } from '../../store/builder-store';
import { Canvas } from './Canvas';

beforeEach(() => {
  useBuilderStore.getState().reset();
});

describe('Canvas', () => {
  it('shows an empty state when there are no blocks', () => {
    useBuilderStore.getState().setDocument({ name: 'T', theme: DEFAULT_THEME, blocks: [] });
    render(<Canvas />);
    expect(screen.getByText(/Añade bloques/)).toBeInTheDocument();
  });

  it('renders blocks, selects on click and removes', () => {
    useBuilderStore.getState().setDocument(createDefaultTemplate());
    const firstId = useBuilderStore.getState().document?.blocks[0]?.id;
    render(<Canvas />);

    fireEvent.click(screen.getByRole('button', { name: /Encabezado/ }));
    expect(useBuilderStore.getState().selectedBlockId).toBe(firstId);

    const before = useBuilderStore.getState().document?.blocks.length ?? 0;
    fireEvent.click(screen.getAllByRole('button', { name: 'Eliminar bloque' })[0] as HTMLElement);
    expect(useBuilderStore.getState().document?.blocks).toHaveLength(before - 1);
  });

  it('lets the block content shrink so cards do not overflow a narrow canvas', () => {
    useBuilderStore.getState().setDocument(createDefaultTemplate());
    render(<Canvas />);
    const contentButton = screen.getAllByRole('button', { name: /Encabezado/ })[0] as HTMLElement;
    // `min-w-0` is required for the inner text to truncate instead of forcing
    // the card wider than the (resizable) canvas.
    expect(contentButton.className).toContain('min-w-0');
  });

  it('reorders blocks with the move up/down buttons', () => {
    useBuilderStore.getState().setDocument(createDefaultTemplate());
    const ids = useBuilderStore.getState().document?.blocks.map((block) => block.id) ?? [];
    render(<Canvas />);

    fireEvent.click(screen.getAllByRole('button', { name: 'Mover abajo' })[0] as HTMLElement);
    const afterDown = useBuilderStore.getState().document?.blocks.map((block) => block.id) ?? [];
    expect(afterDown[0]).toBe(ids[1]);
    expect(afterDown[1]).toBe(ids[0]);

    // The first block can no longer move up.
    expect(screen.getAllByRole('button', { name: 'Mover arriba' })[0]).toBeDisabled();
  });
});
