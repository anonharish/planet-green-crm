import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { Button } from '../../../components/ui/button';
import { ChevronLeft, ChevronRight, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { cn } from '../../../utils';

export interface ColumnDef<T> {
  key: string;
  header: React.ReactNode;
  width?: string;
  render: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  // Server-side pagination
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  // Sorting
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  // Optional
  emptyMessage?: string;
  rowKey: (row: T) => string | number;
  offset?: number;
}

const SkeletonRow = ({ columns }: { columns: number }) => (
  <TableRow>
    {Array.from({ length: columns }).map((_, i) => (
      <TableCell key={i}>
        <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse w-3/4" />
      </TableCell>
    ))}
  </TableRow>
);

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
  sortField,
  sortOrder,
  onSort,
  emptyMessage = 'No records found.',
  rowKey,
  offset = 0,
}: DataTableProps<T>) {
  const totalPages = Math.ceil(total / limit);
  const globalStart = (page - 1) * limit;
  const from = total === 0 ? 0 : globalStart + 1;
  const to = Math.min(globalStart + limit, total);

  // Relative slicing: calculate where in the provided 'data' array the current 'page' starts
  const relativeStart = Math.max(0, globalStart - offset);
  const slicedData = data.slice(relativeStart, relativeStart + limit);

  return (
    <div className="flex flex-col gap-3">
      {/* Table */}
      <div className="rounded-md border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50 dark:bg-zinc-900">
              {columns.map((col) => (
                <TableHead 
                  key={col.key} 
                  style={col.width ? { width: col.width } : undefined}
                  className={cn(
                    "font-semibold text-zinc-700 dark:text-zinc-300 text-xs uppercase tracking-wide",
                    col.sortable && "p-0" // Remove padding for sortable headers to handle it in the button
                  )}
                >
                  {col.sortable ? (
                    <button
                      onClick={() => onSort?.(col.key)}
                      className="flex items-center gap-1 w-full h-full px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left font-bold"
                    >
                      {col.header}
                      <div className="flex flex-col">
                        {sortField === col.key ? (
                          sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-30" />
                        )}
                      </div>
                    </button>
                  ) : (
                    <div className="px-4 py-3">
                      {col.header}
                    </div>
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: limit }).map((_, i) => (
                <SkeletonRow key={i} columns={columns.length} />
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-12 text-zinc-400 text-sm">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              slicedData.map((row, index) => (
                <TableRow key={rowKey(row)} className="hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                  {columns.map((col) => (
                    <TableCell key={col.key} className="text-sm text-zinc-700 dark:text-zinc-300 py-3">
                      {col.render(row, index)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between text-sm text-zinc-500">
        <div className="flex items-center gap-2">
          <span>Rows per page</span>
          <Select value={String(limit)} onValueChange={(v) => { onLimitChange(Number(v)); onPageChange(1); }}>
            <SelectTrigger className="h-8 w-16 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50].map((n) => (
                <SelectItem key={n} value={String(n)}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          <span>
            {from}–{to} of {total}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page <= 1 || isLoading}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page >= totalPages || isLoading}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
