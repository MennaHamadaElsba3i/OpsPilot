import React from 'react';
import { useOperationsUrlState } from '../hooks/useOperationsUrlState';
import { useOperations } from '../hooks/useOperations';
import { OperationStats } from '../components/OperationStats';
import { OperationsToolbar } from '../components/OperationsToolbar';
import { OperationsTable } from '../components/OperationsTable';
import { OperationPagination } from '../components/OperationPagination';
import { OperationsSkeleton } from '../components/OperationsSkeleton';
import { OperationsEmptyState } from '../components/OperationsEmptyState';
import { OperationsErrorState } from '../components/OperationsErrorState';

export const OperationsListPage: React.FC = () => {
  const {
    params,
    searchInput,
    setSearchInput,
    setStatus,
    setSorting,
    setPage,
    setPageSize,
    resetAllFilters,
    rawQueryString,
  } = useOperationsUrlState();

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useOperations(params);

  const hasFilters =
    params.search.trim().length > 0 ||
    params.status !== 'All' ||
    params.sortBy !== 'createdAt' ||
    params.sortOrder !== 'desc' ||
    params.page > 1;

  // Fallback status counts if loading initial query
  const statusCounts = data?.statusCounts || {
    Pending: 0,
    Running: 0,
    Completed: 0,
    Failed: 0,
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Operations Management Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time status tracking, pagination, and orchestration across enterprise infrastructure services.
          </p>
        </div>
      </div>

      {/* Global Status Counts Cards */}
      <OperationStats
        statusCounts={statusCounts}
        currentFilter={params.status}
        onSelectFilter={setStatus}
        isLoading={isLoading}
      />

      {/* Operations Toolbar */}
      <OperationsToolbar
        params={params}
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        onStatusChange={setStatus}
        onSortChange={setSorting}
        onPageSizeChange={setPageSize}
        onResetFilters={resetAllFilters}
        isFetching={isFetching && !isLoading}
        onRefresh={() => refetch()}
      />

      {/* Main Content Area */}
      {isLoading ? (
        <OperationsSkeleton />
      ) : isError ? (
        <OperationsErrorState error={error} onRetry={() => refetch()} />
      ) : !data || data.items.length === 0 ? (
        <OperationsEmptyState hasFilters={hasFilters} onResetFilters={resetAllFilters} />
      ) : (
        <>
          <OperationsTable
            operations={data.items}
            currentQueryString={rawQueryString}
            sortBy={params.sortBy}
            sortOrder={params.sortOrder}
            onSortChange={setSorting}
          />
          <OperationPagination
            page={data.page}
            pageSize={data.pageSize}
            totalCount={data.totalCount}
            totalPages={data.totalPages}
            onPageChange={setPage}
            isLoading={false}
          />
        </>
      )}
    </div>
  );
};
