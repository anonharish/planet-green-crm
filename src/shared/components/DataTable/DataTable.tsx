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
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef as TanStackColumnDef,
} from '@tanstack/react-table';

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
  maxHeight?: string;
  variant?: 'default' | 'embed';
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
  maxHeight,
  variant = 'default',
}: DataTableProps<T>) {
  const totalPages = Math.ceil(total / limit);
  const globalStart = (page - 1) * limit;
  const from = total === 0 ? 0 : globalStart + 1;
  const to = Math.min(globalStart + limit, total);

  const relativeStart = Math.max(0, globalStart - offset);
  const slicedData = data.slice(relativeStart, relativeStart + limit);

  const tanstackColumns = React.useMemo<TanStackColumnDef<T, any>[]>(() => {
    return columns.map((col) => ({
      id: col.key,
      header: () => col.header,
      cell: (info) => col.render(info.row.original, info.row.index),
      size: col.width ? parseInt(col.width) : undefined,
      meta: {
        width: col.width,
        sortable: col.sortable,
      },
    }));
  }, [columns]);

  const table = useReactTable({
    data: slicedData,
    columns: tanstackColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
  });

  return (
    <div className="flex flex-col">
      {/* Table Container */}
      <div
        className={cn(
          "relative overflow-auto scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-800",
          variant === 'default' && "rounded-xl bg-transparent border-none dark:border-zinc-800 bg-white dark:bg-zinc-950"
        )}
        style={maxHeight ? { maxHeight } : undefined}
      >
        <Table className="min-w-full border-separate border-spacing-y-3">
          <TableHeader className="sticky top-0 z-20 bg-gray-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-none hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as { width?: string; sortable?: boolean } | undefined;
                  return (
                    <TableHead
                      key={header.id}
                      style={meta?.width ? { width: meta.width, minWidth: meta.width } : undefined}
                      className={cn(
                        "font-semibold text-gray-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider h-11 whitespace-nowrap bg-inherit",
                        meta?.sortable && "p-0"
                      )}
                    >
                      {header.isPlaceholder ? null : (
                        meta?.sortable ? (
                          <button
                            onClick={() => onSort?.(header.id)}
                            className="flex items-center gap-1.5 w-full h-full px-4 py-3 hover:bg-zinc-100/50 dark:hover:bg-zinc-800 transition-colors text-left whitespace-nowrap"
                          >
                            <span className="truncate">
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                            </span>
                            <div className="flex flex-col opacity-40 shrink-0">
                              {sortField === header.id ? (
                                sortOrder === 'asc' ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />
                              ) : (
                                <ArrowUpDown className="h-2.5 w-2.5" />
                              )}
                            </div>
                          </button>
                        ) : (
                          <div className={cn("px-4 py-3 whitespace-nowrap", header.id === 'selection' && "px-0")}>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </div>
                        )
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="space-y-3">
            {isLoading ? (
              Array.from({ length: limit }).map((_, i) => (
                <SkeletonRow key={i} columns={columns.length} />
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-12 text-zinc-400 text-sm">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="bg-white shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-all"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cn("text-sm text-gray-700 px-4 py-5 bg-white", cell.column.id === 'selection' && "px-0")}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-5 py-4 border-t border-[#f0f4f8] bg-white rounded-b-xl">

        {/* Left text */}
        <div className="text-[13px] text-zinc-500 font-medium">
          Showing <span className="text-zinc-900">{from} - {to}</span> of{" "}
          <span className="text-zinc-900">{total.toLocaleString()}</span> Records
        </div>

        {/* Right pagination */}
        <div className="flex items-center gap-2">

          {/* Previous */}
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-4 rounded-lg border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 flex items-center gap-2"
            disabled={isLoading}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          {/* Page numbers */}
          <div className="flex items-center gap-1 mx-2">

            {/* Current page */}
            <Button
              variant="default"
              size="sm"
              className="h-9 w-9 p-0 rounded-lg bg-[#0f3d6b]! text-white! hover:bg-[#0f3d6b]! shadow-sm"
            >
              {page}
            </Button>

            {/* Dots + last page */}
            {totalPages > 1 && totalPages > page && (
              <>
                <span className="px-2 text-zinc-400">...</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 rounded-lg text-zinc-600 hover:bg-zinc-100"
                  onClick={() => onPageChange(totalPages)}
                >
                  {totalPages}
                </Button>
              </>
            )}
          </div>

          {/* Next */}
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-4 rounded-lg border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 flex items-center gap-2"
            disabled={isLoading}
            onClick={() => onPageChange(page + 1)}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
