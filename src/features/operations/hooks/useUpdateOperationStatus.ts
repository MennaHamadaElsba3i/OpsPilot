import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateOperationStatus } from '../api/operations-api';
import { operationsQueryKeys } from '../api/operations-query-keys';
import {
  Operation,
  OperationListResponse,
  OperationStatus,
} from '../model/operation.types';

interface UpdateStatusVariables {
  id: string;
  newStatus: OperationStatus;
}

interface MutationContext {
  previousDetail?: Operation;
  previousLists: [readonly unknown[], OperationListResponse | undefined][];
  mutationTimestamp: number;
}

// Track latest mutation timestamp per operation ID to prevent stale rollback
const latestMutationTimestamps = new Map<string, number>();

export function useUpdateOperationStatus() {
  const queryClient = useQueryClient();

  return useMutation<Operation, Error, UpdateStatusVariables, MutationContext>({
    mutationFn: async ({ id, newStatus }) => {
      return updateOperationStatus(id, newStatus);
    },

    onMutate: async ({ id, newStatus }) => {
      const mutationTimestamp = Date.now();
      latestMutationTimestamps.set(id, mutationTimestamp);

      // 1. Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: operationsQueryKeys.all });

      // 2. Snapshot current state for rollback
      const previousDetail = queryClient.getQueryData<Operation>(operationsQueryKeys.detail(id));
      const previousLists = queryClient.getQueriesData<OperationListResponse>({
        queryKey: operationsQueryKeys.lists(),
      });

      const optimisticUpdatedAt = new Date().toISOString();

      // 3. Optimistically update Detail query
      if (previousDetail) {
        queryClient.setQueryData<Operation>(operationsQueryKeys.detail(id), {
          ...previousDetail,
          status: newStatus,
          updatedAt: optimisticUpdatedAt,
        });
      }

      // 4. Optimistically update List queries and global status counts
      queryClient.setQueriesData<OperationListResponse>(
        { queryKey: operationsQueryKeys.lists() },
        (oldData) => {
          if (!oldData) return oldData;

          const existingIndex = oldData.items.findIndex((op) => op.id === id);
          const oldOp = existingIndex !== -1 ? oldData.items[existingIndex] : previousDetail;
          const oldStatus = oldOp?.status;

          // Compute updated global counts
          const newStatusCounts = { ...oldData.statusCounts };
          if (oldStatus && oldStatus !== newStatus) {
            newStatusCounts[oldStatus] = Math.max(0, newStatusCounts[oldStatus] - 1);
            newStatusCounts[newStatus] = (newStatusCounts[newStatus] || 0) + 1;
          }

          if (existingIndex === -1) {
            // Item wasn't on this page; just return with updated global counts
            return {
              ...oldData,
              statusCounts: newStatusCounts,
            };
          }

          const updatedItem: Operation = {
            ...oldData.items[existingIndex],
            status: newStatus,
            updatedAt: optimisticUpdatedAt,
          };

          const newItems = [...oldData.items];
          newItems[existingIndex] = updatedItem;

          return {
            ...oldData,
            items: newItems,
            statusCounts: newStatusCounts,
          };
        }
      );

      return { previousDetail, previousLists, mutationTimestamp };
    },

    onError: (_error, { id }, context) => {
      if (!context) return;

      // Ensure a stale failed mutation does not undo a newer mutation to the same operation
      const currentLatest = latestMutationTimestamps.get(id);
      if (currentLatest && currentLatest > context.mutationTimestamp) {
        // A newer mutation has already started, do not roll back
        return;
      }

      // Rollback detail
      if (context.previousDetail) {
        queryClient.setQueryData(operationsQueryKeys.detail(id), context.previousDetail);
      }

      // Rollback lists
      for (const [key, oldData] of context.previousLists) {
        queryClient.setQueryData(key, oldData);
      }
    },

    onSettled: (_data, _error, { id }) => {
      // Invalidate relevant queries so remote server state is cleanly reconciled
      queryClient.invalidateQueries({ queryKey: operationsQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: operationsQueryKeys.lists() });
    },
  });
}
