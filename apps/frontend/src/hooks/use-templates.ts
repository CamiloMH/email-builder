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

/** React Query key for the template list. */
export const templatesQueryKey = ['templates'] as const;

/**
 * Loads the current visitor's templates.
 *
 * @returns The query result for the template list.
 */
export function useTemplates(): UseQueryResult<TemplateResponse[]> {
  return useQuery({ queryKey: templatesQueryKey, queryFn: templatesApi.list });
}

/**
 * Creates a template and invalidates the list on success.
 *
 * @returns The create mutation.
 */
export function useCreateTemplate(): UseMutationResult<TemplateResponse, Error, TemplateDocument> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (document: TemplateDocument) => templatesApi.create(document),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: templatesQueryKey });
    },
  });
}

/**
 * Deletes a template and invalidates the list on success.
 *
 * @returns The delete mutation.
 */
export function useDeleteTemplate(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => templatesApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: templatesQueryKey });
    },
  });
}
