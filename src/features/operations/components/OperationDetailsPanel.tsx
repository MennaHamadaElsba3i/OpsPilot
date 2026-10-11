import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Shield,
  FileText,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Operation, OperationStatus } from '../model/operation.types';
import { OperationStatusBadge } from './OperationStatusBadge';
import { formatDateTime } from '../utils/operation-formatters';
import { useUpdateOperationStatus } from '../hooks/useUpdateOperationStatus';
import { cn } from '@/shared/lib/cn';

interface OperationDetailsPanelProps {
  operation: Operation;
}

const ALL_STATUSES: OperationStatus[] = ['Pending', 'Running', 'Completed', 'Failed'];

export const OperationDetailsPanel: React.FC<OperationDetailsPanelProps> = ({ operation }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const updateStatusMutation = useUpdateOperationStatus();
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Preserve previous search string when returning back to list
  const handleBackToList = () => {
    navigate({
      pathname: '/operations',
      search: location.search || '',
    });
  };

  const handleStatusChange = (newStatus: OperationStatus) => {
    if (newStatus === operation.status) return;

    setFeedbackMessage(null);
    updateStatusMutation.mutate(
      { id: operation.id, newStatus },
      {
        onSuccess: (updated) => {
          setFeedbackMessage(`Status updated successfully to ${updated.status}.`);
          setTimeout(() => setFeedbackMessage(null), 4000);
        },
        onError: (err) => {
          setFeedbackMessage(`Failed to update status: ${err.message}`);
        },
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleBackToList}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-subtle"
          aria-label="Back to operations list"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Operations List
        </button>

        <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          {operation.id}
        </span>
      </div>

      {/* Main Details Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-card space-y-8">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {operation.name}
              </h1>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Orchestrated infrastructure task managed via Operations Control
            </p>
          </div>

          <div className="flex items-center gap-3">
            <OperationStatusBadge status={operation.status} size="lg" />
          </div>
        </div>

        {/* Feedback Message Banner */}
        {feedbackMessage && (
          <div
            role="status"
            className={cn(
              'p-3 rounded-xl text-xs font-medium flex items-center gap-2 border',
              updateStatusMutation.isError
                ? 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900'
            )}
          >
            {updateStatusMutation.isError ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <Check className="w-4 h-4 shrink-0" />
            )}
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Status Lifecycle Controls */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-5 border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              Update Status Lifecycle
            </label>
            {updateStatusMutation.isPending && (
              <span className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Persisting update...
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {ALL_STATUSES.map((st) => {
              const isCurrent = operation.status === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleStatusChange(st)}
                  disabled={updateStatusMutation.isPending}
                  className={cn(
                    'py-2.5 px-3 text-xs font-semibold rounded-lg border text-center transition-all',
                    isCurrent
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-500/30'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  )}
                  aria-pressed={isCurrent}
                >
                  {isCurrent && <Check className="w-3 h-3 inline mr-1" />}
                  Set {st}
                </button>
              );
            })}
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Assignee */}
          <div className="flex items-start gap-3 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500 block">
                Assigned Engineer
              </span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {operation.assignee}
              </span>
            </div>
          </div>

          {/* Priority */}
          <div className="flex items-start gap-3 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500 block">
                Execution Priority
              </span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {operation.priority || 'Medium'}
              </span>
            </div>
          </div>

          {/* Creation Date */}
          <div className="flex items-start gap-3 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500 block">
                Created Timestamp
              </span>
              <span className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 block">
                {formatDateTime(operation.createdAt)}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {operation.createdAt}
              </span>
            </div>
          </div>

          {/* Updated Date */}
          <div className="flex items-start gap-3 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500 block">
                Last Updated Timestamp
              </span>
              <span className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 block">
                {formatDateTime(operation.updatedAt)}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {operation.updatedAt}
              </span>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            <FileText className="w-4 h-4 text-slate-400" />
            <span>Operation Scope & Description</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            {operation.description ||
              'Standard operational workflow executed across the cloud deployment infrastructure with automated health validation.'}
          </p>
        </div>
      </div>
    </div>
  );
};
