import React from 'react';
import { Bell, ShieldCheck } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 shadow-subtle">
      {/* Left: Brand logo & Breadcrumb */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 mr-2 pr-3 border-r border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-sm">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
            OpsPilot
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Workspace</span>
          <span className="text-slate-300">/</span>
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Operations Center
          </span>
        </div>
      </div>

      {/* Right: Notification & Avatar */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button
          type="button"
          className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-slate-900" />
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 text-white flex items-center justify-center font-bold text-xs ring-2 ring-slate-100 dark:ring-slate-800 shadow-sm">
            OP
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
              Lead SRE
            </div>
            <div className="text-[10px] text-slate-400 leading-tight">
              Operations Admin
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
