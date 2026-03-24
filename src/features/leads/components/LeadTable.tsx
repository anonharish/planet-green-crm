import React from 'react';
import { DataTable } from '../../../shared/components/DataTable/DataTable';
import { usePermissions } from '../../../hooks/usePermissions';
import { Pencil, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '../../../components/ui/dropdown-menu';
import { Badge } from '../../../components/ui/badge';
import type { Lead } from '../types';
import type { ColumnDef } from '../../../shared/components/DataTable/DataTable';

interface LeadTableProps {
  data: Lead[];
  isLoading: boolean;
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (uuid: string) => void;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;
}

export const LeadTable = ({
  data,
  isLoading,
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
  onEdit,
  onDelete,
  sortField,
  sortOrder,
  onSort
}: LeadTableProps) => {
  const { can } = usePermissions();

  const fallback = (value: any) => value ?? '--';

  const columns: ColumnDef<Lead>[] = [
    {
      key: 'first_name',
      header: 'First Name',
      sortable: true,
      width: '260px',
      render: (l) => <span className="font-medium text-zinc-900 dark:text-zinc-100">{fallback(l.first_name)}</span>,
    },
    {
      key: 'last_name',
      header: 'Last Name',
      sortable: true,
      width: '260px',
      render: (l) => <span>{fallback(l.last_name)}</span>,
    },
    {
      key: 'email_address',
      header: 'Email Address',
      sortable: true,
      width: '300px',
      render: (l) => <span className="text-zinc-500">{fallback(l.email_address)}</span>,
    },
    {
      key: 'source_employee_user_id',
      header: 'Source',
      width: '200px',
      render: (l) => (
        <span className="text-xs text-zinc-600 dark:text-zinc-400">
          {l.source_employee_user_id ? `${l.source_employee_user_id}` : '--'}
        </span>
      ),
    },
    {
      key: 'lead_status_id',
      header: 'Status',
      sortable: true,
      width: '200px',
      render: (l) => (
        <Badge variant="outline" className="text-[10px] py-0 px-2 font-bold uppercase bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          {l.lead_status_id}
        </Badge>
      ),
    },
    {
      key: 'lead_priority_id',
      header: 'Priority',
      sortable: true,
      width: '200px',
      render: (l) => (
        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          {l.lead_priority_id}
        </span>
      ),
    },
    {
      key: 'assigned_to_rm',
      header: 'Assigned RM',
      width: '200px',
      render: (l) => <span className="text-xs">{l.assigned_to_rm ? `${l.assigned_to_rm}` : '--'}</span>,
    },
    {
      key: 'assigned_to_em',
      header: 'Assigned EM',
      width: '200px',
      render: (l) => <span className="text-xs">{l.assigned_to_em ? `${l.assigned_to_em}` : '--'}</span>,
    },
    {
      key: 'occupation',
      header: 'Occupation',
      width: '200px',
      render: (l) => <span className="text-xs text-zinc-500">{fallback(l.occupation)}</span>,
    },
    {
      key: 'city',
      header: 'City',
      width: '20px',
      render: (l) => <span className="text-xs">{fallback(l.city)}</span>,
    },
    {
      key: 'state',
      header: 'State',
      width: '200px',
      render: (l) => <span className="text-xs">{fallback(l.state)}</span>,
    },
    {
      key: 'country',
      header: 'Country',
      width: '200px',
      render: (l) => <span className="text-xs">{fallback(l.country)}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '60px',
      render: (lead) => (
        <div className="flex items-center justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 text-xs">
              <DropdownMenuLabel className="font-normal text-zinc-500 uppercase px-3 py-2">
                Lead Actions
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(lead)} className="cursor-pointer gap-2 py-2">
                <Pencil className="h-4 w-4 text-blue-500" />
                <span>Edit Lead</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(lead.uuid)} 
                className="cursor-pointer gap-2 py-2 text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Lead</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns as any}
      data={data}
      isLoading={isLoading}
      page={page}
      limit={limit}
      total={total}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
      rowKey={(l) => l.uuid}
      sortField={sortField}
      sortOrder={sortOrder}
      onSort={onSort as any}
    />
  );
};
