import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RisingDots } from './RisingDots';

describe('RisingDots', () => {
  it('renders the requested number of decorative dots', () => {
    const { container } = render(<RisingDots count={5} />);
    expect(container.querySelectorAll('.rising-dot')).toHaveLength(5);
  });
});
