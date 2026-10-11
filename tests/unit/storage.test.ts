import { describe, it, expect, beforeEach } from 'vitest';
import {
  OperationsStorage,
  isValidOperation,
  validateOperationsArray,
  OPERATIONS_STORAGE_KEY,
} from '@/infrastructure/persistence/operations-storage';
import { LocalStorageAdapter } from '@/infrastructure/persistence/storage-adapter';
import { Operation } from '@/features/operations/model/operation.types';

describe('Storage and Validation Unit Tests', () => {
  let storage: OperationsStorage;
  let adapter: LocalStorageAdapter<any>;

  beforeEach(() => {
    localStorage.clear();
    adapter = new LocalStorageAdapter();
    storage = new OperationsStorage(adapter);
  });

  describe('Validation functions', () => {
    it('validates a correct operation object', () => {
      const validOp: Operation = {
        id: 'OP-00001',
        name: 'Database Migration',
        assignee: 'Elena Rostova',
        status: 'Running',
        createdAt: '2026-09-15T08:00:00.000Z',
        updatedAt: '2026-09-15T09:30:00.000Z',
      };
      expect(isValidOperation(validOp)).toBe(true);
    });

    it('rejects objects missing required fields or with invalid status', () => {
      expect(isValidOperation(null)).toBe(false);
      expect(isValidOperation({})).toBe(false);
      expect(isValidOperation({ id: 'OP-1' })).toBe(false);
      expect(
        isValidOperation({
          id: 'OP-1',
          name: 'Task',
          assignee: 'Alex',
          status: 'InvalidStatus' as any,
          createdAt: '2026-09-15T08:00:00.000Z',
          updatedAt: '2026-09-15T09:30:00.000Z',
        })
      ).toBe(false);
    });

    it('validates an array of operations and rejects corrupted arrays', () => {
      const validOps: Operation[] = [
        {
          id: 'OP-00001',
          name: 'Task 1',
          assignee: 'Sarah',
          status: 'Pending',
          createdAt: '2026-09-15T08:00:00.000Z',
          updatedAt: '2026-09-15T09:30:00.000Z',
        },
      ];

      expect(validateOperationsArray(validOps)).toHaveLength(1);
      expect(validateOperationsArray('not-an-array')).toBeNull();
      expect(validateOperationsArray([{ corrupted: true }])).toBeNull();
    });
  });

  describe('OperationsStorage persistence & versioning', () => {
    const sampleOps: Operation[] = [
      {
        id: 'OP-00001',
        name: 'Task 1',
        assignee: 'Sarah',
        status: 'Pending',
        createdAt: '2026-09-15T08:00:00.000Z',
        updatedAt: '2026-09-15T09:30:00.000Z',
      },
    ];

    it('saves and loads valid data enveloped with version', () => {
      const saved = storage.save(sampleOps);
      expect(saved).toBe(true);

      const loaded = storage.load();
      expect(loaded).toHaveLength(1);
      expect(loaded![0].id).toBe('OP-00001');
    });

    it('returns null safely when schema version mismatches', () => {
      // Store envelope with outdated version
      adapter.set(OPERATIONS_STORAGE_KEY, {
        version: '0.0.1',
        operations: sampleOps,
        lastModified: new Date().toISOString(),
      });

      const loaded = storage.load();
      expect(loaded).toBeNull();
    });

    it('handles corrupted JSON in localStorage gracefully without crashing', () => {
      localStorage.setItem(OPERATIONS_STORAGE_KEY, '{ invalid JSON string syntax ');

      const loaded = storage.load();
      expect(loaded).toBeNull();
    });

    it('updates a single operation in storage reliably', () => {
      storage.save(sampleOps);

      const updatedOp: Operation = {
        ...sampleOps[0],
        status: 'Completed',
        updatedAt: new Date().toISOString(),
      };

      const { success, updatedDataset } = storage.updateSingle(updatedOp, sampleOps);
      expect(success).toBe(true);
      expect(updatedDataset[0].status).toBe('Completed');

      // Verify reloaded from storage has the new status
      const reloaded = storage.load();
      expect(reloaded![0].status).toBe('Completed');
    });
  });
});
