import React from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { cn } from '../../../utils';

interface FilterPopoverProps {
  children: React.ReactNode;
  onReset?: () => void;
  activeFilterCount?: number;
  align?: 'start' | 'center' | 'end';
}

export const FilterPopover = ({ children, onReset, activeFilterCount = 0, align = 'end' }: FilterPopoverProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2 relative">
          <SlidersHorizontal className="h-4 w-4" />
          Filter
          {activeFilterCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-primary text-primary-foreground rounded-full">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align={align} className="w-80 p-4 space-y-4 rounded-2xl shadow-lg border border-border/50">
        <div className="flex items-center justify-between pb-2 border-b border-border/40">
          <p className="text-sm font-bold text-foreground">Filter Leads</p>
          {onReset && activeFilterCount > 0 && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="h-3 w-3" />
              Reset
            </button>
          )}
        </div>
        <div className="space-y-3">
          {children}
        </div>
      </PopoverContent>
    </Popover>
  );
};
