import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { OperationStatus } from '../model/operation.types';
import { getStatusBadgeStyle } from '../utils/operation-formatters';
import { cn } from '@/shared/lib/cn';

interface OperationStatusBadgeProps {
  status: OperationStatus;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

export const OperationStatusBadge: React.FC<OperationStatusBadgeProps> = ({
  status,
  className,
  size = 'md',
  interactive = false,
}) => {
  const styles = getStatusBadgeStyle(status);
  const shouldReduceMotion = useReducedMotion();

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs font-medium px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2',
  }[size];

  const dotSize = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  }[size];

  return (
    <motion.span
      layout
      transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 30 }}
      className={cn(
        'inline-flex items-center rounded-full border shadow-subtle transition-colors duration-150',
        styles.bg,
        styles.text,
        styles.border,
        sizeClasses,
        interactive && 'cursor-pointer hover:shadow',
        className
      )}
    >
      <span
        className={cn(
          'rounded-full',
          dotSize,
          styles.dot,
          status === 'Running' && 'animate-pulse'
        )}
        aria-hidden="true"
      />
      <span>{status}</span>
    </motion.span>
  );
};
