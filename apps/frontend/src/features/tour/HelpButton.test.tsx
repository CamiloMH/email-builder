import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HelpButton } from './HelpButton';

describe('HelpButton', () => {
  it('starts the tour when clicked', () => {
    const onClick = vi.fn();
    render(<HelpButton onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: 'Ayuda / Tour' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
