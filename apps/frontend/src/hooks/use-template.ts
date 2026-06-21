import type { TemplateDocument } from '@email/core';
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { templatesApi } from '../api/templates.api';
import type { TemplateResponse } from '../api/types';
import { templatesQueryKey } from './use-templates';

/**
 * React Query key for a single template.
 *
 * @param id - The template id.
 * @returns The query key tuple.
 */
export function templateQueryKey(id: string): readonly [string, string] {
  return ['template', id];
}

/**
 * Loads a single template by id.
 *
 * @param id - The template id.
 * @returns The query result for the template.
 */
export function useTemplate(id: string): UseQueryResult<TemplateResponse> {
  return useQuery({ queryKey: templateQueryKey(id), queryFn: () => templatesApi.get(id) });
}

/**
 * Updates a template, refreshing caches on success.
 *
 * @param id - The template id.
 * @returns The update mutation.
 */
export function useUpdateTemplate(
  id: string,
): UseMutationResult<TemplateResponse, Error, TemplateDocument> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (document: TemplateDocument) => templatesApi.update(id, document),
    onSuccess: (data) => {
      queryClient.setQueryData(templateQueryKey(id), data);
      void queryClient.invalidateQueries({ queryKey: templatesQueryKey });
    },
  });
}
