import { OperationListParams } from '../model/operation.types';

export const operationsQueryKeys = {
  all: ['operations'] as const,
  lists: () => [...operationsQueryKeys.all, 'list'] as const,
  list: (params: OperationListParams) => [
    ...operationsQueryKeys.lists(),
    {
      search: (params.search || '').trim().toLowerCase(),
      status: params.status || 'All',
      sortBy: params.sortBy || 'createdAt',
      sortOrder: params.sortOrder || 'desc',
      page: Number(params.page) || 1,
      pageSize: Number(params.pageSize) || 10,
    },
  ] as const,
  details: () => [...operationsQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...operationsQueryKeys.details(), id] as const,
};
