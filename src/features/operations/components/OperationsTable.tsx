import React from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { Operation, OperationSortBy, SortOrder } from '../model/operation.types';
import { OperationRow } from './OperationRow';

interface OperationsTableProps {
  operations: Operation[];
  currentQueryString: string;
  sortBy: OperationSortBy;
  sortOrder: SortOrder;
  onSortChange: (sortBy: OperationSortBy, sortOrder: SortOrder) => void;
}

export const OperationsTable: React.FC<OperationsTableProps> = ({
  operations,
  currentQueryString,
  sortBy,
  sortOrder,
  onSortChange,
}) => {
  const handleSortClick = (field: OperationSortBy) => {
    if (sortBy === field) {
      onSortChange(field, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(field, 'desc');
    }
  };

  const renderSortIndicator = (field: OperationSortBy) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-slate-500" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
    );
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
      <table className="w-full text-left border-collapse" role="table">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/60 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <th scope="col" className="px-4 py-3.5 whitespace-nowrap">
              Operation ID
            </th>
            <th scope="col" className="px-4 py-3.5 min-w-[200px]">
              Name / Domain
            </th>
            <th scope="col" className="px-4 py-3.5 whitespace-nowrap">
              Assignee
            </th>
            <th scope="col" className="px-4 py-3.5 whitespace-nowrap">
              Status
            </th>
            <th scope="col" className="px-4 py-3.5 whitespace-nowrap">
              <button
                type="button"
                onClick={() => handleSortClick('createdAt')}
                className="group flex items-center gap-1.5 focus:outline-none focus:text-blue-600"
                aria-label={`Sort by creation date (${sortBy === 'createdAt' ? sortOrder : 'none'})`}
              >
                <span>Created At</span>
                {renderSortIndicator('createdAt')}
              </button>
            </th>
            <th scope="col" className="px-4 py-3.5 whitespace-nowrap">
              <button
                type="button"
                onClick={() => handleSortClick('updatedAt')}
                className="group flex items-center gap-1.5 focus:outline-none focus:text-blue-600"
                aria-label={`Sort by last updated date (${sortBy === 'updatedAt' ? sortOrder : 'none'})`}
              >
                <span>Last Updated</span>
                {renderSortIndicator('updatedAt')}
              </button>
            </th>
            <th scope="col" className="px-3 py-3.5 text-right whitespace-nowrap">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {operations.map((operation) => (
            <OperationRow
              key={operation.id}
              operation={operation}
              currentQueryString={currentQueryString}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
