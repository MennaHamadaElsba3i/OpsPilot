import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Edit3, Check } from 'lucide-react';
import { Operation, OperationStatus } from '../model/operation.types';
import { OperationStatusBadge } from './OperationStatusBadge';
import { formatDateTime } from '../utils/operation-formatters';
import { useUpdateOperationStatus } from '../hooks/useUpdateOperationStatus';
import { cn } from '@/shared/lib/cn';

interface OperationRowProps {
  operation: Operation;
  currentQueryString: string;
}

const ALL_STATUSES: OperationStatus[] = ['Pending', 'Running', 'Completed', 'Failed'];

const STATUS_DOT_COLORS: Record<OperationStatus, string> = {
  Pending: 'bg-amber-400',
  Running: 'bg-blue-500 animate-pulse',
  Completed: 'bg-emerald-500',
  Failed: 'bg-rose-500',
};

export const OperationRow: React.FC<OperationRowProps> = ({ operation, currentQueryString }) => {
  const navigate = useNavigate();
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const updateStatusMutation = useUpdateOperationStatus();

  const handleRowClick = (e: React.MouseEvent) => {
    // Prevent navigation if user clicked status menu or inside button
    if ((e.target as HTMLElement).closest('button, select, [data-prevent-nav]')) {
      return;
    }
    navigateToDetails();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigateToDetails();
    }
  };

  const navigateToDetails = () => {
    navigate({
      pathname: `/operations/${operation.id}`,
      search: currentQueryString ? `?${currentQueryString}` : '',
    });
  };

  const handleStatusChange = (newStatus: OperationStatus) => {
    setShowStatusMenu(false);
    if (newStatus !== operation.status) {
      updateStatusMutation.mutate({
        id: operation.id,
        newStatus,
      });
    }
  };

  return (
    <tr
      onClick={handleRowClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="row"
      className={cn(
        'group cursor-pointer border-b border-slate-100 dark:border-slate-800/80 transition-colors',
        'hover:bg-slate-50/80 dark:hover:bg-slate-800/50 focus:outline-none focus:bg-blue-50/40 dark:focus:bg-blue-950/20'
      )}
      aria-label={`Operation ${operation.id}: ${operation.name}`}
    >
      {/* ID */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">
          {operation.id}
        </span>
      </td>

      {/* Name & Priority */}
      <td className="px-4 py-3.5">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {operation.name}
          </span>
          {operation.priority && (
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">
              Priority: {operation.priority}
            </span>
          )}
        </div>
      </td>

      {/* Assignee */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-300">
            {operation.assignee.charAt(0)}
          </div>
          <span className="text-sm text-slate-600 dark:text-slate-300">
            {operation.assignee}
          </span>
        </div>
      </td>

      {/* Status Badge with Quick Changer */}
      <td className="px-4 py-3.5 whitespace-nowrap" data-prevent-nav>
        <div className="relative inline-block text-left">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowStatusMenu(!showStatusMenu);
            }}
            className="flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 rounded-full"
            title="Click to change status"
            aria-expanded={showStatusMenu}
            aria-haspopup="true"
          >
            <OperationStatusBadge status={operation.status} interactive />
            <Edit3 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          {showStatusMenu && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowStatusMenu(false);
                }}
              />
              <div className="absolute left-0 mt-1.5 w-40 rounded-xl bg-white dark:bg-slate-800 shadow-dropdown border border-slate-200 dark:border-slate-700 p-1 z-30 focus:outline-none animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Change Status
                </div>
                {ALL_STATUSES.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(st);
                    }}
                    className={cn(
                      'w-full text-left px-2.5 py-1.5 text-xs rounded-lg flex items-center justify-between transition-colors duration-100 cursor-pointer',
                      st === operation.status
                        ? 'font-semibold text-blue-600 dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/40'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span className={cn('w-2 h-2 rounded-full shrink-0', STATUS_DOT_COLORS[st])} aria-hidden="true" />
                      <span>{st}</span>
                    </span>
                    {st === operation.status && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </td>

      {/* Created At */}
      <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400 font-mono">
        {formatDateTime(operation.createdAt)}
      </td>

      {/* Updated At */}
      <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400 font-mono">
        {formatDateTime(operation.updatedAt)}
      </td>

      {/* Action Arrow */}
      <td className="px-3 py-3.5 whitespace-nowrap text-right">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigateToDetails();
          }}
          className="p-1 rounded text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label={`View details for ${operation.id}`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
};
