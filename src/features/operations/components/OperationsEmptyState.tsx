import React from 'react';
import { SearchX, RotateCcw } from 'lucide-react';

interface OperationsEmptyStateProps {
  hasFilters: boolean;
  onResetFilters: () => void;
}

export const OperationsEmptyState: React.FC<OperationsEmptyStateProps> = ({
  hasFilters,
  onResetFilters,
}) => {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-12 text-center my-6">
      <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 mb-4">
        <SearchX className="w-6 h-6" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
        {hasFilters ? 'No operations match your criteria' : 'No operations found'}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5">
        {hasFilters
          ? 'Try adjusting your search query, clearing status filters, or resetting sorting options.'
          : 'The operations catalog is currently empty. Initialize seed data to get started.'}
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={onResetFilters}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset All Filters
        </button>
      )}
    </div>
  );
};
