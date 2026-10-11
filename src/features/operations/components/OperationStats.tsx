import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Clock, Play, CheckCircle2, AlertCircle, Layers } from 'lucide-react';
import { OperationStatus, StatusCounts } from '../model/operation.types';
import { cn } from '@/shared/lib/cn';

interface OperationStatsProps {
  statusCounts: StatusCounts;
  totalCount?: number;
  currentFilter: OperationStatus | 'All';
  onSelectFilter: (status: OperationStatus | 'All') => void;
  isLoading?: boolean;
}

export const OperationStats: React.FC<OperationStatsProps> = ({
  statusCounts,
  currentFilter,
  onSelectFilter,
  isLoading = false,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const total =
    statusCounts.Pending +
    statusCounts.Running +
    statusCounts.Completed +
    statusCounts.Failed;

  const cards = [
    {
      key: 'All' as const,
      label: 'Total Operations',
      count: total,
      icon: Layers,
      color: 'text-slate-700 dark:text-slate-200',
      bgHover: 'hover:border-slate-400 dark:hover:border-slate-500',
      activeRing: 'ring-2 ring-slate-600 bg-white dark:bg-slate-800 shadow-md',
      iconBg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    },
    {
      key: 'Pending' as const,
      label: 'Pending',
      count: statusCounts.Pending,
      icon: Clock,
      color: 'text-amber-700 dark:text-amber-400',
      bgHover: 'hover:border-amber-400 dark:hover:border-amber-600',
      activeRing: 'ring-2 ring-amber-500 bg-amber-50/50 dark:bg-amber-950/30 shadow-md',
      iconBg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
    },
    {
      key: 'Running' as const,
      label: 'Running',
      count: statusCounts.Running,
      icon: Play,
      color: 'text-sky-700 dark:text-sky-400',
      bgHover: 'hover:border-sky-400 dark:hover:border-sky-600',
      activeRing: 'ring-2 ring-sky-500 bg-sky-50/50 dark:bg-sky-950/30 shadow-md',
      iconBg: 'bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300',
    },
    {
      key: 'Completed' as const,
      label: 'Completed',
      count: statusCounts.Completed,
      icon: CheckCircle2,
      color: 'text-emerald-700 dark:text-emerald-400',
      bgHover: 'hover:border-emerald-400 dark:hover:border-emerald-600',
      activeRing: 'ring-2 ring-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 shadow-md',
      iconBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
    },
    {
      key: 'Failed' as const,
      label: 'Failed',
      count: statusCounts.Failed,
      icon: AlertCircle,
      color: 'text-rose-700 dark:text-rose-400',
      bgHover: 'hover:border-rose-400 dark:hover:border-rose-600',
      activeRing: 'ring-2 ring-rose-500 bg-rose-50/50 dark:bg-rose-950/30 shadow-md',
      iconBg: 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300',
    },
  ];

  return (
    <div
      role="region"
      aria-label="Operation status overview"
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6"
    >
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = currentFilter === card.key;

        return (
          <motion.button
            key={card.key}
            type="button"
            onClick={() => onSelectFilter(card.key)}
            whileHover={shouldReduceMotion ? undefined : { y: -2 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            className={cn(
              'flex flex-col text-left p-3.5 rounded-xl border border-slate-200 dark:border-slate-800',
              'bg-white dark:bg-slate-900 transition-all duration-150 relative cursor-pointer group',
              card.bgHover,
              isSelected ? card.activeRing : 'hover:shadow-sm'
            )}
            aria-pressed={isSelected}
            aria-label={`${card.label}: ${card.count.toLocaleString()} operations`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {card.label}
              </span>
              <div className={cn('p-1.5 rounded-lg transition-transform', card.iconBg)}>
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span
                className={cn(
                  'text-2xl font-bold tracking-tight',
                  card.color,
                  isLoading && 'opacity-60 animate-pulse'
                )}
              >
                {card.count.toLocaleString()}
              </span>
            </div>

            {isSelected && (
              <span className="absolute bottom-1 right-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Active Filter
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
};
