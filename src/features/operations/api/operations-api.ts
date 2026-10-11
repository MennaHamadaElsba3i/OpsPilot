import { mockOperationsApi } from '@/infrastructure/mock-api/mock-operations-api';
import {
  Operation,
  OperationListParams,
  OperationListResponse,
  OperationStatus,
} from '../model/operation.types';

export async function fetchOperations(
  params: OperationListParams = {},
  signal?: AbortSignal
): Promise<OperationListResponse> {
  return mockOperationsApi.fetchOperations(params, { signal });
}

export async function fetchOperationById(
  id: string,
  signal?: AbortSignal
): Promise<Operation> {
  return mockOperationsApi.fetchOperationById(id, { signal });
}

export async function updateOperationStatus(
  id: string,
  newStatus: OperationStatus
): Promise<Operation> {
  return mockOperationsApi.updateOperationStatus(id, newStatus);
}
