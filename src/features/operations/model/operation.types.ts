export type OperationStatus = 'Pending' | 'Running' | 'Completed' | 'Failed';

export interface Operation {
  id: string;
  name: string;
  assignee: string;
  status: OperationStatus;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  description?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
}

export type OperationSortBy = 'createdAt' | 'updatedAt';
export type SortOrder = 'asc' | 'desc';

export interface OperationListParams {
  search?: string;
  status?: OperationStatus | 'All';
  sortBy?: OperationSortBy;
  sortOrder?: SortOrder;
  page?: number;
  pageSize?: number;
}

export type StatusCounts = Record<OperationStatus, number>;

export interface OperationListResponse {
  items: Operation[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  statusCounts: StatusCounts;
}

export interface UpdateOperationStatusPayload {
  status: OperationStatus;
}
