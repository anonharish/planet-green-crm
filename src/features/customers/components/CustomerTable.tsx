import React from 'react';
import { DataTable } from '../../../shared/components/DataTable/DataTable';
import { Badge } from '../../../components/ui/badge';
import type { Customer } from '../types';
import type { ColumnDef } from '../../../shared/components/DataTable/DataTable';
import { useMasterDataLookup } from '../../../shared/hooks/useMasterDataLookup';

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
  offset = 0
}: CustomerTableProps) => {
  const { getCustomerStatusLabel, isLoading: isLookupLoading } = useMasterDataLookup();

  const fallback = (value: any) => value ?? '--';

  const columns: ColumnDef<Customer>[] = [
    {
      key: 'first_name',
      header: 'First Name',
      sortable: true,
      width: '180px',
      render: (c) => <span className="font-medium text-zinc-900 dark:text-zinc-100">{fallback(c.first_name)}</span>,
    },
    {
      key: 'last_name',
      header: 'Last Name',
      width: '180px',
      render: (c) => <span>{fallback(c.last_name)}</span>,
    },
    {
      key: 'phone_number',
      header: 'Phone Number',
      width: '160px',
      render: (c) => <span className="text-zinc-500 font-mono text-xs">{fallback(c.phone_number)}</span>,
    },
    {
      key: 'email_address',
      header: 'Email',
      width: '240px',
      render: (c) => <span className="text-zinc-500">{fallback(c.email_address)}</span>,
    },
    {
      key: 'occupation',
      header: 'Occupation',
      width: '200px',
      render: (c) => <span className="text-xs text-zinc-500 italic">{fallback(c.occupation)}</span>,
    },
    {
      key: 'city',
      header: 'City',
      width: '150px',
      render: (c) => <span className="text-xs">{fallback(c.city)}</span>,
    },
    {
      key: 'customer_status_id',
      header: 'Status',
      width: '150px',
      render: (c) => (
        <Badge variant="outline" className="text-[10px] py-0 px-2 font-bold uppercase bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          {getCustomerStatusLabel(c.customer_status_id)}
        </Badge>
      ),
    },
    {
      key: 'created_on',
      header: 'Created On',
      sortable: true,
      width: '180px',
      render: (c) => (
        <span className="text-xs text-zinc-500">
          {c.created_on ? new Date(c.created_on).toLocaleDateString() : '--'}
        </span>
      ),
    },
  ];

  return (
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
    />
  );
};
