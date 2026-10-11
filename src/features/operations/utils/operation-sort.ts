import { Operation, OperationSortBy, SortOrder } from '../model/operation.types';

export function compareOperations(
  a: Operation,
  b: Operation,
  sortBy: OperationSortBy,
  sortOrder: SortOrder
): number {
  const timeA = new Date(a[sortBy]).getTime();
  const timeB = new Date(b[sortBy]).getTime();

  if (timeA !== timeB) {
    return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
  }

  // Deterministic secondary sort by ID
  return a.id.localeCompare(b.id);
}
