import { DataTable } from '../../../shared/components/DataTable/DataTable';
import { SearchInput } from '../../../shared/components/FilterBar/FilterBar';
import { Badge } from '../../../components/ui/badge';
import type { Customer } from '../types';
import type { ColumnDef } from '../../../shared/components/DataTable/DataTable';
import { useMasterDataLookup } from '../../../shared/hooks/useMasterDataLookup';
import { MoreVertical, Eye, Pencil } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '../../../components/ui/dropdown-menu';

import { usePermissions } from '../../../hooks/usePermissions';
import { PERMISSIONS } from '../../../config/permissions';

interface CustomerTableProps {
  data: Customer[];
  isLoading: boolean;
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  offset?: number;
  onViewLeads?: (customer: Customer) => void;
  onEdit?: (customer: Customer) => void;
  search: string;
  onSearchChange: (value: string) => void;
}

export const CustomerTable = ({
  data,
  isLoading,
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
  sortField,
  sortOrder,
  onSort,
  offset = 0,
  onViewLeads,
  onEdit,
  search,
  onSearchChange
}: CustomerTableProps) => {
  const { getCustomerStatusLabel, isLoading: isLookupLoading } = useMasterDataLookup();
  const { can } = usePermissions();

  const fallback = (value: any) => value ?? '--';

  const columns: ColumnDef<Customer>[] = [
    {
      key: 'uuid',
      header: 'CUSTOMER ID',
      width: '120px',
      render: (c) => (
        <span className="font-bold text-primary text-xs uppercase tracking-tighter ml-4">
          #{(c.uuid || '').slice(0, 6)}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'NAME',
      sortable: true,
      width: '200px',
      render: (c) => (
        <span className="font-bold text-primary text-xs">
          {c.first_name} {c.last_name}
        </span>
      ),
    },
    {
      key: 'contact_info',
      header: 'CONTACT INFO',
      width: '220px',
      render: (c) => (
        <div className="flex flex-col">
          <span className="font-medium text-zinc-800 dark:text-zinc-200 text-xs">{fallback(c.phone_number)}</span>
          <span className="text-[11px] text-zinc-400">{fallback(c.email_address)}</span>
        </div>
      ),
    },
    {
      key: 'occupation',
      header: 'OCCUPATION',
      width: '180px',
      render: (c) => (
        <span className="text-zinc-600 dark:text-zinc-400 font-medium text-xs">
          {fallback(c.occupation)}
        </span>
      ),
    },
    {
      key: 'city',
      header: 'CITY',
      width: '150px',
      render: (c) => <span className="text-zinc-600 dark:text-zinc-400 font-medium text-xs">{fallback(c.city)}</span>,
    },
    {
      key: 'customer_status_id',
      header: 'STATUS',
      width: '140px',
      render: (c) => (
        <Badge variant="outline" className="text-[10px] py-0.5 px-3 font-bold uppercase rounded-full border-primary/40 text-primary bg-primary/5">
          {getCustomerStatusLabel(c.customer_status_id)}
        </Badge>
      ),
    },
    {
      key: 'created_on',
      header: 'CREATED ON',
      sortable: true,
      width: '150px',
      render: (c) => (
        <span className="text-zinc-500 font-medium text-xs">
          {c.created_on ? new Date(c.created_on).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '--'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'ACTIONS',
      width: '100px',
      render: (c) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewLeads?.(c)}
          className="h-8 text-[11px] font-bold uppercase rounded-xl border-zinc-200 dark:border-zinc-800 text-primary hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all px-4 shadow-none"
        >
          View Leads
        </Button>
      ),
    },
  ];

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[32px] overflow-hidden shadow-sm">
      {/* Integrated Header */}
      <div className="px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Active Customers Queue
          </h2>
          <div className="h-2 w-2 rounded-full bg-red-500 mt-1" />
        </div>
        <div className="w-full max-w-xs transition-all duration-300 focus-within:max-w-md">
          <SearchInput 
            value={search} 
            onChange={onSearchChange} 
            placeholder="Search Customers" 
          />
        </div>
      </div>

      <DataTable
        columns={columns as any}
        data={data}
        isLoading={isLoading || isLookupLoading}
        page={page}
        limit={limit}
        total={total}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        rowKey={(c) => c.uuid}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={onSort as any}
        offset={offset}
        variant="embed"
      />
    </div>
  );
};
