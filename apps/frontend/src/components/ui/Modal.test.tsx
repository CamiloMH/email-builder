import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Modal } from './Modal';

describe('Modal', () => {
  it('renders nothing when closed', () => {
    render(
      <Modal open={false} title="T" onClose={vi.fn()}>
        contenido
      </Modal>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders content and closes via button, Escape and backdrop', () => {
    const onClose = vi.fn();
    render(
      <Modal open title="Mi modal" onClose={onClose}>
        <p>contenido</p>
      </Modal>,
    );

    expect(screen.getByRole('dialog', { name: 'Mi modal' })).toBeInTheDocument();
    expect(screen.getByText('contenido')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);

    // Clicking the dialog itself does not close; the backdrop does.
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledTimes(2);
    fireEvent.click(screen.getByRole('dialog').parentElement as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(3);
  });
});
