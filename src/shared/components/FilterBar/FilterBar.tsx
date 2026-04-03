import React from 'react';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchInput = ({ value, onChange, placeholder = 'Search...' }: SearchInputProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-8 w-full h-11 rounded-full bg-white dark:bg-zinc-800 border border-border/50 focus:border-border transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};

interface DateRangeFilterProps {
  fromDate: string;
  toDate: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
}

export const DateRangeFilter = ({ fromDate, toDate, onFromChange, onToChange }: DateRangeFilterProps) => {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="date"
        value={fromDate}
        onChange={(e) => onFromChange(e.target.value)}
        className="w-36 text-sm"
        placeholder="From"
      />
      <span className="text-zinc-400 text-sm">–</span>
      <Input
        type="date"
        value={toDate}
        onChange={(e) => onToChange(e.target.value)}
        className="w-36 text-sm"
        placeholder="To"
      />
    </div>
  );
};

interface FilterBarProps {
  children: React.ReactNode;
  onReset?: () => void;
}

export const FilterBar = ({ children, onReset }: FilterBarProps) => {
  return (
    <div className="flex flex-wrap items-center gap-3 py-3">
      {children}
      {onReset && (
        <Button variant="ghost" size="sm" onClick={onReset} className="text-zinc-500 hover:text-zinc-800">
          <X className="h-3.5 w-3.5 mr-1" />
          Reset
        </Button>
      )}
    </div>
  );
};
