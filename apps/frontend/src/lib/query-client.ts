import { QueryClient } from '@tanstack/react-query';

/**
 * Creates a configured TanStack Query client.
 *
 * @returns A new {@link QueryClient}.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30_000 },
    },
  });
}
