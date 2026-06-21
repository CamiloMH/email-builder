import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SendStatus, SendTestModal } from './SendTestModal';

describe('SendTestModal', () => {
  it('submits the recipient address', () => {
    const onSubmit = vi.fn();
    render(
      <SendTestModal open status={SendStatus.Idle} onClose={vi.fn()} onSubmit={onSubmit} />,
    );
    fireEvent.change(screen.getByLabelText('Correo de destino'), {
      target: { value: 'me@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }));
    expect(onSubmit).toHaveBeenCalledWith('me@example.com');
  });

  it('disables the submit button while sending', () => {
    render(
      <SendTestModal open status={SendStatus.Pending} onClose={vi.fn()} onSubmit={vi.fn()} />,
    );
    expect(screen.getByRole('button', { name: 'Enviando…' })).toBeDisabled();
  });
});
