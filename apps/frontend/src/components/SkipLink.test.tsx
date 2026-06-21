import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MAIN_CONTENT_ID, SkipLink } from './SkipLink';

describe('SkipLink', () => {
  it('links to the main content region', () => {
    render(<SkipLink />);
    expect(screen.getByRole('link', { name: 'Saltar al contenido' })).toHaveAttribute(
      'href',
      `#${MAIN_CONTENT_ID}`,
    );
  });
});
