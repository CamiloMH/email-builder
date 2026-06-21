import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { blocksApi } from '../api/blocks.api';
import type { BlockDefinitionDto } from '../api/types';

/** React Query key for the block catalog. */
export const blocksQueryKey = ['blocks'] as const;

/**
 * Loads the block catalog used by the palette.
 *
 * @returns The query result for the block catalog.
 */
export function useBlocks(): UseQueryResult<BlockDefinitionDto[]> {
  return useQuery({ queryKey: blocksQueryKey, queryFn: blocksApi.list });
}
