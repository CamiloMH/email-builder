import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Logo } from './Logo';

describe('Logo', () => {
  it('is decorative (hidden from assistive tech) by default', () => {
    const { container } = render(<Logo />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('exposes an accessible label when provided', () => {
    render(<Logo label="Email Builder" />);
    expect(screen.getByRole('img', { name: 'Email Builder' })).toBeInTheDocument();
  });
});
