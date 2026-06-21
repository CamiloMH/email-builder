import { BlockType, DEFAULT_THEME } from '@email/core';
import { fireEvent, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useBuilderStore } from '../../store/builder-store';
import { renderWithProviders } from '../../test/render';
import { BlockPalette } from './BlockPalette';

vi.mock('../../api/blocks.api', () => ({
  blocksApi: {
    list: vi.fn().mockResolvedValue([
      { type: 'text', label: 'Texto', description: 'Un párrafo', icon: 'type', defaultProps: {} },
      {
        type: 'button',
        label: 'Botón',
        description: 'Una llamada a la acción',
        icon: 'mouse-pointer-click',
        defaultProps: {},
      },
    ]),
  },
}));

beforeEach(() => {
  useBuilderStore.getState().setDocument({ name: 'T', theme: DEFAULT_THEME, blocks: [] });
});

describe('BlockPalette', () => {
  it('lists the catalog and appends a block on click', async () => {
    renderWithProviders(<BlockPalette />);
    await screen.findByRole('button', { name: /Texto/ });

    fireEvent.click(screen.getByRole('button', { name: /Botón/ }));

    const blocks = useBuilderStore.getState().document?.blocks ?? [];
    expect(blocks).toHaveLength(1);
    expect(blocks[0]?.type).toBe(BlockType.Button);
  });
});
