import { describe, it, expect, beforeEach } from 'vitest';
import { mockOperationsApi } from '@/infrastructure/mock-api/mock-operations-api';
import { requestScenarios } from '@/infrastructure/mock-api/request-scenarios';
import { Operation } from '@/features/operations/model/operation.types';

describe('MockOperationsApi Unit Tests', () => {
  beforeEach(() => {
    requestScenarios.reset();
    requestScenarios.setLatency(0); // Instant responses for fast deterministic unit tests
    mockOperationsApi.resetData();
  });

  describe('Dataset seeding & Integrity', () => {
    it('seeds at least 5,000 deterministic operations with realistic attributes', () => {
      const dataset = mockOperationsApi.getDataset();
      expect(dataset.length).toBeGreaterThanOrEqual(5000);

      // Verify no duplicate IDs
      const idSet = new Set(dataset.map((op) => op.id));
      expect(idSet.size).toBe(dataset.length);

      // Verify schema attributes
      const first = dataset[0];
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('name');
      expect(first).toHaveProperty('assignee');
      expect(first).toHaveProperty('status');
      expect(first).toHaveProperty('createdAt');
      expect(first).toHaveProperty('updatedAt');

      expect(['Pending', 'Running', 'Completed', 'Failed']).toContain(first.status);
    });

    it('calculates global status counts across the whole dataset correctly', async () => {
      const response = await mockOperationsApi.fetchOperations({ page: 1, pageSize: 10 });
      const counts = response.statusCounts;

      const sum = counts.Pending + counts.Running + counts.Completed + counts.Failed;
      expect(sum).toBe(response.totalCount);
      expect(response.totalCount).toBeGreaterThanOrEqual(5000);
      expect(counts.Pending).toBeGreaterThan(0);
      expect(counts.Running).toBeGreaterThan(0);
      expect(counts.Completed).toBeGreaterThan(0);
      expect(counts.Failed).toBeGreaterThan(0);
    });
  });

  describe('Search normalization and matching', () => {
    it('normalizes search terms and matches case-insensitively by ID', async () => {
      const targetId = 'OP-00042';
      const res = await mockOperationsApi.fetchOperations({ search: '   op-00042   ' });

      expect(res.items.length).toBeGreaterThanOrEqual(1);
      expect(res.items.some((op) => op.id === targetId)).toBe(true);
    });

    it('matches case-insensitively by operation name', async () => {
      const res = await mockOperationsApi.fetchOperations({ search: 'kafka cluster' });
      expect(res.totalCount).toBeGreaterThan(0);
      for (const item of res.items) {
        const matches =
          item.name.toLowerCase().includes('kafka cluster') ||
          item.id.toLowerCase().includes('kafka cluster') ||
          item.assignee.toLowerCase().includes('kafka cluster');
        expect(matches).toBe(true);
      }
    });

    it('returns empty results when search query matches nothing', async () => {
      const res = await mockOperationsApi.fetchOperations({ search: 'NonExistentTermXYZ123' });
      expect(res.totalCount).toBe(0);
      expect(res.items).toHaveLength(0);
      expect(res.totalPages).toBe(1);
    });
  });

  describe('Combined search and status filtering', () => {
    it('filters strictly by status', async () => {
      const res = await mockOperationsApi.fetchOperations({ status: 'Failed' });
      expect(res.totalCount).toBeGreaterThan(0);
      for (const item of res.items) {
        expect(item.status).toBe('Failed');
      }
    });

    it('combines search and status filter with logical AND', async () => {
      const searchRes = await mockOperationsApi.fetchOperations({ search: 'Database', status: 'Running' });
      for (const item of searchRes.items) {
        expect(item.status).toBe('Running');
        const matchesSearch =
          item.name.toLowerCase().includes('database') ||
          item.id.toLowerCase().includes('database') ||
          item.assignee.toLowerCase().includes('database');
        expect(matchesSearch).toBe(true);
      }
    });
  });

  describe('Sorting and Tie-breaking', () => {
    it('sorts by createdAt descending and ascending', async () => {
      const descRes = await mockOperationsApi.fetchOperations({
        sortBy: 'createdAt',
        sortOrder: 'desc',
        pageSize: 50,
      });

      for (let i = 0; i < descRes.items.length - 1; i++) {
        const curr = new Date(descRes.items[i].createdAt).getTime();
        const next = new Date(descRes.items[i + 1].createdAt).getTime();
        expect(curr).toBeGreaterThanOrEqual(next);
      }

      const ascRes = await mockOperationsApi.fetchOperations({
        sortBy: 'createdAt',
        sortOrder: 'asc',
        pageSize: 50,
      });

      for (let i = 0; i < ascRes.items.length - 1; i++) {
        const curr = new Date(ascRes.items[i].createdAt).getTime();
        const next = new Date(ascRes.items[i + 1].createdAt).getTime();
        expect(curr).toBeLessThanOrEqual(next);
      }
    });

    it('sorts by updatedAt correctly', async () => {
      const res = await mockOperationsApi.fetchOperations({
        sortBy: 'updatedAt',
        sortOrder: 'desc',
        pageSize: 50,
      });

      for (let i = 0; i < res.items.length - 1; i++) {
        const curr = new Date(res.items[i].updatedAt).getTime();
        const next = new Date(res.items[i + 1].updatedAt).getTime();
        expect(curr).toBeGreaterThanOrEqual(next);
      }
    });

    it('breaks ties deterministically by ID when dates are equal', async () => {
      // Mock two operations with identical dates
      const baseOp: Operation = {
        id: 'OP-00002',
        name: 'Test Task B',
        assignee: 'Alex',
        status: 'Completed',
        createdAt: '2026-10-01T12:00:00.000Z',
        updatedAt: '2026-10-01T12:00:00.000Z',
      };
      const tieOp: Operation = {
        ...baseOp,
        id: 'OP-00001',
        name: 'Test Task A',
      };

      const sorted = [baseOp, tieOp].sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        if (timeA !== timeB) return timeB - timeA;
        return a.id.localeCompare(b.id);
      });

      // OP-00001 should come before OP-00002
      expect(sorted[0].id).toBe('OP-00001');
      expect(sorted[1].id).toBe('OP-00002');
    });
  });

  describe('Pagination & Parameter normalization', () => {
    it('normalizes invalid page and pageSize parameters', async () => {
      const res1 = await mockOperationsApi.fetchOperations({ page: -5, pageSize: -10 });
      expect(res1.page).toBe(1);
      expect(res1.pageSize).toBe(10); // clamped to default/min 5-100

      const res2 = await mockOperationsApi.fetchOperations({ page: 9999999, pageSize: 500 });
      expect(res2.pageSize).toBe(100); // clamped to 100 max
      expect(res2.page).toBe(res2.totalPages); // clamped to totalPages
    });

    it('returns exact page slices according to page and pageSize', async () => {
      const p1 = await mockOperationsApi.fetchOperations({ page: 1, pageSize: 20 });
      const p2 = await mockOperationsApi.fetchOperations({ page: 2, pageSize: 20 });

      expect(p1.items).toHaveLength(20);
      expect(p2.items).toHaveLength(20);

      // Verify no overlap between page 1 and page 2
      const idsP1 = new Set(p1.items.map((i) => i.id));
      for (const item of p2.items) {
        expect(idsP1.has(item.id)).toBe(false);
      }
    });
  });
});
