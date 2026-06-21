import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';
import { createQueryClient } from './query-client';

describe('createQueryClient', () => {
  it('creates a configured QueryClient', () => {
    const client = createQueryClient();
    expect(client).toBeInstanceOf(QueryClient);
    expect(client.getDefaultOptions().queries?.retry).toBe(1);
  });
});
