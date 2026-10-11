import { OperationStatus } from '../model/operation.types';

export function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date);
  } catch {
    return 'Invalid Date';
  }
}

export function formatDateShort(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    }).format(date);
  } catch {
    return 'Invalid Date';
  }
}

export interface StatusStyleConfig {
  bg: string;
  text: string;
  border: string;
  dot: string;
  hover: string;
}

export function getStatusBadgeStyle(status: OperationStatus): StatusStyleConfig {
  switch (status) {
    case 'Pending':
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/40',
        text: 'text-amber-800 dark:text-amber-300',
        border: 'border-amber-200 dark:border-amber-800/60',
        dot: 'bg-amber-500',
        hover: 'hover:bg-amber-100 dark:hover:bg-amber-900/40',
      };
    case 'Running':
      return {
        bg: 'bg-sky-50 dark:bg-sky-950/40',
        text: 'text-sky-800 dark:text-sky-300',
        border: 'border-sky-200 dark:border-sky-800/60',
        dot: 'bg-sky-500',
        hover: 'hover:bg-sky-100 dark:hover:bg-sky-900/40',
      };
    case 'Completed':
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        text: 'text-emerald-800 dark:text-emerald-300',
        border: 'border-emerald-200 dark:border-emerald-800/60',
        dot: 'bg-emerald-500',
        hover: 'hover:bg-emerald-100 dark:hover:bg-emerald-900/40',
      };
    case 'Failed':
      return {
        bg: 'bg-rose-50 dark:bg-rose-950/40',
        text: 'text-rose-800 dark:text-rose-300',
        border: 'border-rose-200 dark:border-rose-800/60',
        dot: 'bg-rose-500',
        hover: 'hover:bg-rose-100 dark:hover:bg-rose-900/40',
      };
  }
}
