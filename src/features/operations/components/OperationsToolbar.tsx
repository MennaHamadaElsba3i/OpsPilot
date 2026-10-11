import React from 'react';
import { Search, X, ArrowUpDown, Filter, RotateCw, RefreshCcw } from 'lucide-react';
import {
  OperationListParams,
  OperationSortBy,
  OperationStatus,
  SortOrder,
} from '../model/operation.types';
import { cn } from '@/shared/lib/cn';
import { CustomSelect, CustomSelectOption } from '@/shared/ui/CustomSelect';

const statusOptions: CustomSelectOption<OperationStatus | 'All'>[] = [
  { value: 'All', label: 'All Statuses' },
  { value: 'Pending', label: 'Pending', badgeDotColor: 'bg-amber-500' },
  { value: 'Running', label: 'Running', badgeDotColor: 'bg-sky-500', badgePulse: true },
  { value: 'Completed', label: 'Completed', badgeDotColor: 'bg-emerald-500' },
  { value: 'Failed', label: 'Failed', badgeDotColor: 'bg-rose-500' },
];

const sortFieldOptions: CustomSelectOption<OperationSortBy>[] = [
  { value: 'createdAt', label: 'Date Created' },
  { value: 'updatedAt', label: 'Last Updated' },
];

const sortOrderOptions: CustomSelectOption<SortOrder>[] = [
  { value: 'desc', label: 'Descending' },
  { value: 'asc', label: 'Ascending' },
];

const pageSizeOptions: CustomSelectOption<number>[] = [
  { value: 10, label: '10' },
  { value: 20, label: '20' },
  { value: 50, label: '50' },
  { value: 100, label: '100' },
];

interface OperationsToolbarProps {
  params: Required<OperationListParams>;
  searchInput: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (status: OperationStatus | 'All') => void;
  onSortChange: (sortBy: OperationSortBy, sortOrder: SortOrder) => void;
  onPageSizeChange: (pageSize: number) => void;
  onResetFilters: () => void;
  isFetching: boolean;
  onRefresh: () => void;
}

export const OperationsToolbar: React.FC<OperationsToolbarProps> = ({
  params,
  searchInput,
  onSearchChange,
  onStatusChange,
  onSortChange,
  onPageSizeChange,
  onResetFilters,
  isFetching,
  onRefresh,
}) => {
  const hasActiveFilters =
    params.search.trim().length > 0 ||
    params.status !== 'All' ||
    params.sortBy !== 'createdAt' ||
    params.sortOrder !== 'desc' ||
    params.page > 1;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-4 shadow-subtle space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[280px]">
          <label htmlFor="operations-search-input" className="sr-only">
            Search operations by ID or name
          </label>
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" aria-hidden="true" />
          </div>
          <input
            id="operations-search-input"
            type="text"
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by operation name, ID (e.g. OP-00120), or assignee..."
            className="w-full pl-9 pr-9 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="status-select" className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              Status:
            </label>
            <CustomSelect
              id="status-select"
              value={params.status}
              options={statusOptions}
              onChange={(val) => onStatusChange(val)}
              aria-label="Filter by status"
            />
          </div>

          {/* Sort By Field */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="sort-field-select" className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              Sort:
            </label>
            <CustomSelect
              id="sort-field-select"
              value={params.sortBy}
              options={sortFieldOptions}
              onChange={(val) => onSortChange(val, params.sortOrder)}
              aria-label="Sort by field"
            />
          </div>

          {/* Sort Order Direction */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="sort-order-select" className="sr-only">
              Sort Order
            </label>
            <CustomSelect
              id="sort-order-select"
              value={params.sortOrder}
              options={sortOrderOptions}
              onChange={(val) => onSortChange(params.sortBy, val)}
              aria-label={`Sort order: ${params.sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
            />
          </div>

          {/* Page Size */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="page-size-select" className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Per Page:
            </label>
            <CustomSelect
              id="page-size-select"
              value={params.pageSize}
              options={pageSizeOptions}
              onChange={(val) => onPageSizeChange(Number(val))}
              aria-label="Items per page"
            />
          </div>

          {/* Refresh Action */}
          <button
            type="button"
            onClick={onRefresh}
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 transition-colors"
            title="Refresh operations"
            aria-label="Refresh data"
          >
            <RefreshCcw className={cn('w-4 h-4', isFetching && 'animate-spin text-blue-600')} />
          </button>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-xs font-medium py-1.5 px-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-lg transition-colors flex items-center gap-1"
            >
              <RotateCw className="w-3 h-3" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Subtle indicator for background refetching */}
      {isFetching && (
        <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 pt-1">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          <span>Synchronizing latest operations in background...</span>
        </div>
      )}
    </div>
  );
};
