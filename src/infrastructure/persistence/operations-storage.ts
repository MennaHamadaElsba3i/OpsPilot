import { Operation, OperationStatus } from '@/features/operations/model/operation.types';
import { LocalStorageAdapter, StorageAdapter } from './storage-adapter';

export const OPERATIONS_STORAGE_KEY = 'ops_dashboard_data_v1';
export const CURRENT_STORAGE_VERSION = '1.0.0';

export interface OperationsStorageSchema {
  version: string;
  operations: Operation[];
  lastModified: string;
}

const VALID_STATUSES: Set<OperationStatus> = new Set(['Pending', 'Running', 'Completed', 'Failed']);

export function isValidOperation(item: unknown): item is Operation {
  if (!item || typeof item !== 'object') return false;
  const op = item as Record<string, unknown>;

  return (
    typeof op.id === 'string' &&
    op.id.trim().length > 0 &&
    typeof op.name === 'string' &&
    typeof op.assignee === 'string' &&
    typeof op.status === 'string' &&
    VALID_STATUSES.has(op.status as OperationStatus) &&
    typeof op.createdAt === 'string' &&
    !isNaN(Date.parse(op.createdAt)) &&
    typeof op.updatedAt === 'string' &&
    !isNaN(Date.parse(op.updatedAt))
  );
}

export function validateOperationsArray(data: unknown): Operation[] | null {
  if (!Array.isArray(data)) return null;
  const validOps: Operation[] = [];
  for (const item of data) {
    if (isValidOperation(item)) {
      validOps.push(item);
    } else {
      // If corrupted items found, return null to prompt clean re-seeding
      return null;
    }
  }
  return validOps;
}

export class OperationsStorage {
  private adapter: StorageAdapter<OperationsStorageSchema>;

  constructor(adapter: StorageAdapter<OperationsStorageSchema> = new LocalStorageAdapter()) {
    this.adapter = adapter;
  }

  load(): Operation[] | null {
    const envelope = this.adapter.get(OPERATIONS_STORAGE_KEY);
    if (!envelope) return null;

    if (envelope.version !== CURRENT_STORAGE_VERSION) {
      console.warn(`[OperationsStorage] Schema version mismatch: expected ${CURRENT_STORAGE_VERSION}, found ${envelope.version}`);
      return null;
    }

    const validated = validateOperationsArray(envelope.operations);
    if (!validated || validated.length === 0) {
      console.warn('[OperationsStorage] Data failed validation or was empty');
      return null;
    }

    return validated;
  }

  save(operations: Operation[]): boolean {
    const envelope: OperationsStorageSchema = {
      version: CURRENT_STORAGE_VERSION,
      operations,
      lastModified: new Date().toISOString(),
    };
    return this.adapter.set(OPERATIONS_STORAGE_KEY, envelope);
  }

  updateSingle(updatedOperation: Operation, currentDataset: Operation[]): { success: boolean; updatedDataset: Operation[] } {
    if (!isValidOperation(updatedOperation)) {
      return { success: false, updatedDataset: currentDataset };
    }

    const index = currentDataset.findIndex((op) => op.id === updatedOperation.id);
    if (index === -1) {
      return { success: false, updatedDataset: currentDataset };
    }

    const nextDataset = [...currentDataset];
    nextDataset[index] = updatedOperation;

    const saved = this.save(nextDataset);
    if (!saved) {
      return { success: false, updatedDataset: currentDataset };
    }

    return { success: true, updatedDataset: nextDataset };
  }

  clear(): boolean {
    return this.adapter.remove(OPERATIONS_STORAGE_KEY);
  }
}

export const operationsStorage = new OperationsStorage();
