import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface OperationsErrorStateProps {
  error: Error | null;
  onRetry: () => void;
  title?: string;
}

export const OperationsErrorState: React.FC<OperationsErrorStateProps> = ({
  error,
  onRetry,
  title = 'Failed to load operations',
}) => {
  return (
    <div
      role="alert"
      className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 p-8 text-center my-6"
    >
      <div className="mx-auto w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4">
        <AlertTriangle className="w-6 h-6" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-rose-900 dark:text-rose-200 mb-1">
        {title}
      </h3>
      <p className="text-sm text-rose-700 dark:text-rose-400 max-w-md mx-auto mb-5 font-mono text-xs bg-rose-100/50 dark:bg-rose-900/30 p-2.5 rounded-lg border border-rose-200/50">
        {error?.message || 'An unexpected error occurred while communicating with the Operations API.'}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Retry Request
      </button>
    </div>
  );
};
