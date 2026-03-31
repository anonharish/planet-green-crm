import React from 'react';
import { cn } from '../../../utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  badge?: {
    text: string;
    variant?: 'success' | 'warning' | 'error' | 'neutral';
  };
  className?: string;
}

export const MetricCard = ({
  title,
  value,
  badge,
  className
}: MetricCardProps) => {
  const badgeStyles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    error: 'bg-rose-50 text-rose-700 border-rose-100',
    neutral: 'bg-zinc-50 text-zinc-600 border-zinc-100',
  };

  return (
    <div className={cn(
      "bg-white dark:bg-zinc-900 border border-border/40 rounded-3xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all duration-300",
      className
    )}>
      <div className="flex flex-col space-y-4">
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
          {title}
        </p>
        <div className="flex items-end justify-between">
          <h3 className="text-4xl font-bold text-foreground tracking-tight">
            {value}
          </h3>
          {/* {badge && (
            <span className={cn(
              "px-3 py-1 rounded-full text-[10px] font-bold border transition-colors",
              badgeStyles[badge.variant || 'neutral']
            )}>
              {badge.text}
            </span>
          )} */}
        </div>
      </div>
    </div>
  );
};
