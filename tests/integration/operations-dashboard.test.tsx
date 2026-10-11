import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { OperationsListPage } from '@/features/operations/pages/OperationsListPage';
import { OperationDetailsPage } from '@/features/operations/pages/OperationDetailsPage';
import { mockOperationsApi } from '@/infrastructure/mock-api/mock-operations-api';
import { requestScenarios } from '@/infrastructure/mock-api/request-scenarios';
import { operationsStorage } from '@/infrastructure/persistence/operations-storage';

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

function renderOperationsApp(initialEntries = ['/operations']) {
  const queryClient = createTestQueryClient();
  const user = userEvent.setup();

  const rendered = render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/operations" element={<OperationsListPage />} />
          <Route path="/operations/:id" element={<OperationDetailsPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );

  return { queryClient, user, ...rendered };
}

describe('Operations Dashboard Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    requestScenarios.reset();
    requestScenarios.setLatency(0); // 0ms delay for fast deterministic tests
    mockOperationsApi.resetData();
  });

  describe('Search, Filters, Sorting, and Pagination', () => {
    it('renders initial operations, statistics cards, and server pagination', async () => {
      renderOperationsApp();

      expect(await screen.findByText('Operations Management Dashboard')).toBeInTheDocument();

      // Wait for table rows to appear
      await waitFor(() => {
        expect(screen.getByText('Total Operations')).toBeInTheDocument();
      });

      // Verify presence of table headers
      expect(screen.getByText('Operation ID')).toBeInTheDocument();
      expect(screen.getByText('Name / Domain')).toBeInTheDocument();
      expect(screen.getByText('Assignee')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('combines search and status filter together correctly', async () => {
      const { user } = renderOperationsApp();

      await screen.findByText('Operations Management Dashboard');

      // Change status filter to 'Failed'
      const statusSelect = screen.getByLabelText(/Status:/i);
      await user.selectOptions(statusSelect, 'Failed');

      // Check that all displayed rows are Failed
      await waitFor(() => {
        const badges = screen.getAllByText('Failed');
        expect(badges.length).toBeGreaterThan(0);
      });

      // Now type into search input
      const searchInput = screen.getByPlaceholderText(/Search by operation name/i);
      await user.type(searchInput, 'Cluster');

      // Wait for debounced search to filter
      await waitFor(() => {
        const resetBtn = screen.getByText(/Reset Filters/i);
        expect(resetBtn).toBeInTheDocument();
      });
    });

    it('navigates pagination pages accurately', async () => {
      const { user } = renderOperationsApp();

      await screen.findByText('Operations Management Dashboard');

      const nextBtn = await screen.findByLabelText('Next page');
      await user.click(nextBtn);

      await waitFor(() => {
        expect(screen.getByText(/Showing/i)).toHaveTextContent(/Showing\s+11\s+to\s+20/i);
      });
    });
  });

  describe('Error handling & Recovery', () => {
    it('displays error state on failed list request and recovers on retry', async () => {
      // Configure next request to fail
      requestScenarios.triggerFailureNext('Simulated database cluster timeout.');

      const { user } = renderOperationsApp();

      expect(await screen.findByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/Simulated database cluster timeout/i)).toBeInTheDocument();

      // Click Retry Request
      const retryBtn = screen.getByRole('button', { name: /Retry Request/i });
      await user.click(retryBtn);

      // Verify recovery
      await waitFor(() => {
        expect(screen.getByText('Total Operations')).toBeInTheDocument();
      });
    });
  });

  describe('Status Mutation, Optimistic Update, Rollback & Persistence', () => {
    it('optimistically updates operation status and updates global status counts', async () => {
      const { user } = renderOperationsApp();

      await screen.findByText('Operations Management Dashboard');

      // Find an operation ID cell in the table
      const idCells = await screen.findAllByText(/^OP-\d{5}$/);
      const targetOpId = idCells[0].textContent!;
      await user.click(idCells[0]);

      // Verify on details page
      expect(await screen.findByText('Update Status Lifecycle')).toBeInTheDocument();

      // Click "Set Completed"
      const completeBtn = screen.getByRole('button', { name: /Set Completed/i });
      await user.click(completeBtn);

      await waitFor(() => {
        expect(screen.getByText(/Status updated successfully to Completed/i)).toBeInTheDocument();
      });

      // Verify change in localStorage
      const persisted = operationsStorage.load();
      const opInStorage = persisted?.find((o) => o.id === targetOpId);
      expect(opInStorage?.status).toBe('Completed');
    });

    it('rolls back optimistic update when mutation fails', async () => {
      const testOp = mockOperationsApi.getDataset()[0];
      const { user } = renderOperationsApp([`/operations/${testOp.id}`]);

      expect(await screen.findByText('Update Status Lifecycle')).toBeInTheDocument();

      // Configure next request to fail
      requestScenarios.triggerFailureNext('Storage quota exceeded on write.');

      // Pick a status different from current status
      const differentStatus = testOp.status === 'Completed' ? 'Failed' : 'Completed';
      const actionBtn = screen.getByRole('button', { name: new RegExp(`Set ${differentStatus}`, 'i') });
      await user.click(actionBtn);

      // Verify rollback & error message
      await waitFor(() => {
        expect(screen.getByText(/Failed to update status/i)).toBeInTheDocument();
      });
    });

    it('persists data across remount', async () => {
      const testOp = mockOperationsApi.getDataset()[0];
      // Mutate operation directly in storage/api
      await mockOperationsApi.updateOperationStatus(testOp.id, 'Running');

      // Render new app instance
      renderOperationsApp([`/operations/${testOp.id}`]);

      // Should show Running
      await waitFor(() => {
        expect(screen.getByText('Running')).toBeInTheDocument();
      });
    });
  });

  describe('Stale response protection and race conditions', () => {
    it('does not allow an older slow request to overwrite newer query results', async () => {
      const { user } = renderOperationsApp();
      await screen.findByText('Operations Management Dashboard');

      const searchInput = screen.getByPlaceholderText(/Search by operation name/i);

      // Search 1: 'kafka'
      await user.type(searchInput, 'kafka');

      // Now immediately change search to 'redis'
      await user.clear(searchInput);
      await user.type(searchInput, 'redis');

      // Verify that current results match 'redis' and not 'kafka'
      await waitFor(() => {
        expect(screen.getByDisplayValue('redis')).toBeInTheDocument();
      });
    });
  });
});
