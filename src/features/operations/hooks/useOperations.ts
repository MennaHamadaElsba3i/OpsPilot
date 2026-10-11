import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchOperations } from '../api/operations-api';
import { operationsQueryKeys } from '../api/operations-query-keys';
import { OperationListParams, OperationListResponse } from '../model/operation.types';

export function useOperations(params: OperationListParams) {
  const queryKey = operationsQueryKeys.list(params);

  return useQuery<OperationListResponse, Error>({
    queryKey,
    queryFn: async ({ signal }) => {
      return fetchOperations(params, signal);
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
}
