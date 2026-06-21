import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SiteFooter } from './SiteFooter';

describe('SiteFooter', () => {
  it('links to GitHub and LinkedIn in a new tab', () => {
    render(<SiteFooter />);
    const github = screen.getByRole('link', { name: /GitHub/ });
    const linkedin = screen.getByRole('link', { name: /LinkedIn/ });
    expect(github).toHaveAttribute('href', 'https://github.com/CamiloMH');
    expect(github).toHaveAttribute('target', '_blank');
    expect(github).toHaveAttribute('rel', expect.stringContaining('noopener'));
    expect(linkedin.getAttribute('href')).toContain('linkedin.com/in/');
  });
});
