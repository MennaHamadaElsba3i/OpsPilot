import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOperationDetails } from '../hooks/useOperationDetails';
import { OperationDetailsPanel } from '../components/OperationDetailsPanel';
import { OperationsErrorState } from '../components/OperationsErrorState';
import { ArrowLeft } from 'lucide-react';

export const OperationDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: operation, isLoading, isError, error, refetch } = useOperationDetails(id);

  if (!id) {
    return (
      <div className="max-w-xl mx-auto my-12 text-center p-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
          Missing Operation Identifier
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          No operation ID was provided in the route URL.
        </p>
        <button
          type="button"
          onClick={() => navigate('/operations')}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Operations
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse" role="status">
        <div className="w-36 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-96 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-6">
          <div className="w-2/3 h-8 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl" />
            <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          </div>
        </div>
        <span className="sr-only">Loading operation details...</span>
      </div>
    );
  }

  if (isError || !operation) {
    return (
      <div className="max-w-xl mx-auto my-8">
        <OperationsErrorState
          error={error}
          onRetry={() => refetch()}
          title={`Operation "${id}" could not be retrieved`}
        />
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => navigate('/operations')}
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to Operations List
          </button>
        </div>
      </div>
    );
  }

  return <OperationDetailsPanel operation={operation} />;
};
