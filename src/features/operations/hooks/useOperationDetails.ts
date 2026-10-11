import { useQuery } from '@tanstack/react-query';
import { fetchOperationById } from '../api/operations-api';
import { operationsQueryKeys } from '../api/operations-query-keys';
import { Operation } from '../model/operation.types';

export function useOperationDetails(id?: string) {
  return useQuery<Operation, Error>({
    queryKey: id ? operationsQueryKeys.detail(id) : ['operations', 'detail', 'none'],
    queryFn: async ({ signal }) => {
      if (!id) {
        throw new Error('Operation ID is required');
      }
      return fetchOperationById(id, signal);
    },
    enabled: Boolean(id),
    staleTime: 1000 * 30,
    retry: false,
  });
}
