import React from 'react';

export const OperationsSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-pulse" role="status" aria-label="Loading operations">
      {/* Table Skeleton */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-subtle">
        <div className="h-11 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800" />
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="px-4 py-4 flex items-center justify-between gap-4">
              <div className="w-20 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="flex-1 max-w-sm h-4 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="w-28 h-4 bg-slate-200 dark:bg-slate-800 rounded hidden md:block" />
              <div className="w-24 h-6 bg-slate-200 dark:bg-slate-800 rounded-full" />
              <div className="w-32 h-4 bg-slate-200 dark:bg-slate-800 rounded hidden lg:block" />
              <div className="w-32 h-4 bg-slate-200 dark:bg-slate-800 rounded hidden lg:block" />
              <div className="w-6 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">Loading operations...</span>
    </div>
  );
};
