import {
  Operation,
  OperationListParams,
  OperationListResponse,
  OperationSortBy,
  OperationStatus,
  SortOrder,
  StatusCounts,
} from '@/features/operations/model/operation.types';
import { operationsStorage } from '../persistence/operations-storage';
import { requestScenarios } from './request-scenarios';

const SEED_COUNT = 5200;

const ACTION_VERBS = [
  'Data Pipeline Synchronization',
  'Kafka Cluster Rebalancing',
  'PostgreSQL Index Rebuild',
  'Redis Cache Eviction',
  'Microservice Deployment',
  'SSL Certificate Renewal',
  'Log Aggregation Cleanup',
  'Database Shard Migration',
  'Vulnerability Patch Audit',
  'DNS Record Propagation',
  'Elasticsearch Cluster Snapshot',
  'Billing Ledger Reconciliation',
  'S3 Bucket Lifecycle Migration',
  'API Gateway Route Invalidation',
  'Kubernetes Pod Autoscaling Audit',
  'OAuth Token Revocation Cycle',
  'Secrets Rotation Workflow',
  'Network Firewall Rule Sync',
  'Tenant Data Isolation Audit',
  'Dead Letter Queue Drain',
];

const SYSTEM_DOMAINS = [
  'US-East Core Cluster',
  'EU-West Payment Gateway',
  'APAC Identity Service',
  'Global CDN Edge',
  'Analytics Warehouse',
  'Customer Billing Engine',
  'Telemetry Ingestion Bus',
  'Inventory Order Router',
  'Compliance Monitor',
  'Search Query Indexer',
];

const ASSIGNEES = [
  'Sarah Jenkins',
  'Alex Rivera',
  'David Chen',
  'Elena Rostova',
  'Marcus Vance',
  'Priya Patel',
  'Liam Gallagher',
  'Amina Mansour',
  'Carlos Mendez',
  'Yuki Tanaka',
  'Hannah Schmidt',
  'Kofi Mensah',
];

const STATUSES: OperationStatus[] = ['Pending', 'Running', 'Completed', 'Failed'];
const PRIORITIES: ('Low' | 'Medium' | 'High' | 'Critical')[] = ['Low', 'Medium', 'High', 'Critical'];

// Deterministic Pseudo-Random Number Generator (LCG)
function createLCG(seed: number = 42) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export function generateSeedOperations(): Operation[] {
  const rand = createLCG(1337);
  const operations: Operation[] = [];
  const baseTime = new Date('2026-09-01T08:00:00.000Z').getTime();
  const maxSpan = 40 * 24 * 60 * 60 * 1000; // 40 days

  for (let i = 1; i <= SEED_COUNT; i++) {
    const verb = ACTION_VERBS[Math.floor(rand() * ACTION_VERBS.length)];
    const domain = SYSTEM_DOMAINS[Math.floor(rand() * SYSTEM_DOMAINS.length)];
    const assignee = ASSIGNEES[Math.floor(rand() * ASSIGNEES.length)];
    const status = STATUSES[Math.floor(rand() * STATUSES.length)];
    const priority = PRIORITIES[Math.floor(rand() * PRIORITIES.length)];

    const createdOffset = Math.floor(rand() * maxSpan);
    const createdTimestamp = baseTime + createdOffset;
    const updatedTimestamp = createdTimestamp + Math.floor(rand() * 48 * 60 * 60 * 1000);

    const padId = String(i).padStart(5, '0');
    operations.push({
      id: `OP-${padId}`,
      name: `${verb} - ${domain}`,
      assignee,
      status,
      priority,
      createdAt: new Date(createdTimestamp).toISOString(),
      updatedAt: new Date(updatedTimestamp).toISOString(),
      description: `Automated maintenance routine for ${domain}. Initiated by orchestration scheduler to ensure high availability and SLA compliance.`,
    });
  }

  return operations;
}

export class MockOperationsApi {
  private inMemoryOperations: Operation[] | null = null;

  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized(): Operation[] {
    if (this.inMemoryOperations) {
      return this.inMemoryOperations;
    }

    // Try loading from persistence
    const persisted = operationsStorage.load();
    if (persisted && persisted.length >= 5000) {
      this.inMemoryOperations = persisted;
      return this.inMemoryOperations;
    }

    // If not persisted or invalid, generate deterministically and persist
    const seeded = generateSeedOperations();
    operationsStorage.save(seeded);
    this.inMemoryOperations = seeded;
    return this.inMemoryOperations;
  }

  getDataset(): Operation[] {
    return this.ensureInitialized();
  }

  calculateStatusCounts(dataset: Operation[]): StatusCounts {
    const counts: StatusCounts = {
      Pending: 0,
      Running: 0,
      Completed: 0,
      Failed: 0,
    };

    for (let i = 0; i < dataset.length; i++) {
      const op = dataset[i];
      if (counts[op.status] !== undefined) {
        counts[op.status]++;
      }
    }

    return counts;
  }

  async fetchOperations(
    params: OperationListParams = {},
    options?: { signal?: AbortSignal; customDelay?: number }
  ): Promise<OperationListResponse> {
    // 1. Read complete dataset
    const allOperations = this.ensureInitialized();

    // 7. Simulated request delay and failure behavior
    await requestScenarios.applySimulation(options?.signal, options?.customDelay);

    // Global status counts representing the whole dataset
    const statusCounts = this.calculateStatusCounts(allOperations);

    // 2. Normalized case-insensitive search against name and ID
    let filtered = allOperations;
    const normalizedSearch = (params.search || '').trim().toLowerCase();

    if (normalizedSearch.length > 0) {
      filtered = filtered.filter((op) => {
        return (
          op.id.toLowerCase().includes(normalizedSearch) ||
          op.name.toLowerCase().includes(normalizedSearch) ||
          op.assignee.toLowerCase().includes(normalizedSearch)
        );
      });
    }

    // 3. Status filter
    if (params.status && params.status !== 'All') {
      filtered = filtered.filter((op) => op.status === params.status);
    }

    // 4. Sort by date field and direction, with deterministic secondary sort by ID
    const sortBy: OperationSortBy = params.sortBy === 'updatedAt' ? 'updatedAt' : 'createdAt';
    const sortOrder: SortOrder = params.sortOrder === 'asc' ? 'asc' : 'desc';

    filtered = [...filtered].sort((a, b) => {
      const timeA = new Date(a[sortBy]).getTime();
      const timeB = new Date(b[sortBy]).getTime();

      if (timeA !== timeB) {
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
      }
      // Stable secondary tie-breaker by ID
      return a.id.localeCompare(b.id);
    });

    // 5. Calculate total results and total pages
    const totalCount = filtered.length;
    const rawPageSize = Number(params.pageSize);
    const pageSize = !rawPageSize || rawPageSize <= 0 ? 10 : Math.max(5, Math.min(100, rawPageSize));
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const rawPage = Number(params.page);
    const page = !rawPage || rawPage <= 0 ? 1 : Math.max(1, Math.min(totalPages, rawPage));

    // 6. Return only the requested page
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = filtered.slice(startIndex, startIndex + pageSize);

    return {
      items: paginatedItems,
      page,
      pageSize,
      totalCount,
      totalPages,
      statusCounts,
    };
  }

  async fetchOperationById(
    id: string,
    options?: { signal?: AbortSignal; customDelay?: number }
  ): Promise<Operation> {
    const dataset = this.ensureInitialized();
    await requestScenarios.applySimulation(options?.signal, options?.customDelay);

    const operation = dataset.find((op) => op.id === id);
    if (!operation) {
      throw new Error(`Operation with ID "${id}" was not found.`);
    }

    return { ...operation };
  }

  async updateOperationStatus(
    id: string,
    newStatus: OperationStatus,
    options?: { signal?: AbortSignal; customDelay?: number }
  ): Promise<Operation> {
    const dataset = this.ensureInitialized();
    await requestScenarios.applySimulation(options?.signal, options?.customDelay);

    const index = dataset.findIndex((op) => op.id === id);
    if (index === -1) {
      throw new Error(`Cannot update: Operation with ID "${id}" was not found.`);
    }

    const updatedOperation: Operation = {
      ...dataset[index],
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    // Update in storage first to guarantee persistence before returning
    const { success, updatedDataset } = operationsStorage.updateSingle(updatedOperation, dataset);
    if (!success) {
      throw new Error(`Persistence failure: Failed to write updated operation "${id}" to local storage.`);
    }

    this.inMemoryOperations = updatedDataset;
    return updatedOperation;
  }

  resetData(): void {
    const seeded = generateSeedOperations();
    operationsStorage.save(seeded);
    this.inMemoryOperations = seeded;
  }
}

export const mockOperationsApi = new MockOperationsApi();
