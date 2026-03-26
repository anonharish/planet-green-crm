import React from 'react';
import { DataTable } from '../../../shared/components/DataTable/DataTable';
import { Pencil, Trash2, MoreVertical, Eye, CalendarClock } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Link } from 'react-router-dom';
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
import { type ColumnDef } from '../../../shared/components/DataTable/DataTable';
import { useAppSelector } from '../../../app/hooks';
import { useMasterDataLookup } from '../../../shared/hooks/useMasterDataLookup';

import { Checkbox } from '../../../components/ui/checkbox';

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
  onScheduleVisit: (lead: Lead) => void;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  // Selection
  selectedUuids?: string[];
  onSelectUuids?: (uuids: string[]) => void;
  offset?: number;
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
  onScheduleVisit,
  sortField,
  sortOrder,
  onSort,
  selectedUuids = [],
  onSelectUuids,
  offset = 0
}: LeadTableProps) => {
  const { currentRole } = useAppSelector((state) => state.auth);
  const roleCode = currentRole?.code || '';
  
  const { 
    getStatusLabel, 
    getProjectLabel, 
    getRmLabel, 
    getEmLabel,
    getSourceLabel,
    isLoading: isLookupLoading 
  } = useMasterDataLookup();

  const fallback = (value: any) => value ?? '--';

  const columns: ColumnDef<Lead>[] = [
    ...( (roleCode === 'SADMIN' || roleCode === 'ADMIN') ? [
      {
        key: 'selection',
        header: (
          <div className="flex items-center justify-center h-full">
            <Checkbox 
              checked={data.length > 0 && selectedUuids.length === data.length}
              onCheckedChange={(checked: boolean) => {
                if (checked) {
                  onSelectUuids?.(data.map(l => l.uuid));
                } else {
                  onSelectUuids?.([]);
                }
              }}
              aria-label="Select all"
            />
          </div>
        ),
        width: '40px',
        render: (l: Lead) => (
          <div className="flex items-center justify-center">
            <Checkbox 
              checked={selectedUuids.includes(l.uuid)}
              onCheckedChange={(checked: boolean) => {
                const newSelection = checked 
                  ? [...selectedUuids, l.uuid]
                  : selectedUuids.filter(id => id !== l.uuid);
                onSelectUuids?.(newSelection);
              }}
              aria-label={`Select lead ${l.lead_id}`}
            />
          </div>
        )
      }
    ] : []),
    {
      key: 'lead_id',
      header: 'ID',
      width: '80px',
      render: (l) => (
        <Link 
          to={`/leads/${l.uuid}`} 
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium hover:underline transition-colors"
        >
          #{fallback(l.lead_id)}
        </Link>
      ),
    },
    {
      key: 'first_name',
      header: 'First Name',
      sortable: true,
      width: '180px',
      render: (l) => <span className="font-medium text-zinc-900 dark:text-zinc-100">{fallback(l.first_name)}</span>,
    },
    {
      key: 'last_name',
      header: 'Last Name',
      sortable: true,
      width: '180px',
      render: (l) => <span>{fallback(l.last_name)}</span>,
    },
    {
      key: 'phone_number',
      header: 'Phone',
      width: '150px',
      render: (l) => <span className="text-zinc-500 font-mono text-xs">{fallback(l.phone_number)}</span>,
    },
    {
      key: 'email_address',
      header: 'Email',
      sortable: true,
      width: '220px',
      render: (l) => <span className="text-zinc-500 truncate block">{fallback(l.email_address)}</span>,
    },
    {
      key: 'source_id',
      header: 'Source',
      width: '150px',
      render: (l) => <span className="text-xs">{getSourceLabel(l.source_id)}</span>,
    },
    {
      key: 'lead_status_id',
      header: 'Status',
      sortable: true,
      width: '150px',
      render: (l) => (
        <Badge variant="outline" className="text-[10px] py-0 px-2 font-bold uppercase bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          {getStatusLabel(l.lead_status_id)}
        </Badge>
      ),
    },
    {
      key: 'project_id',
      header: 'Project',
      width: '150px',
      render: (l) => <span className="text-xs font-medium">{getProjectLabel(l.project_id)}</span>,
    },
    // Conditional: RM for Admin/Super Admin (SADMIN, ADMIN)
    ...( (roleCode === 'SADMIN' || roleCode === 'ADMIN') ? [
      {
        key: 'assigned_to_rm',
        header: 'Assigned RM',
        width: '180px',
        render: (l: Lead) => <span className="text-xs text-zinc-500">{getRmLabel(l.assigned_to_rm)}</span>,
      }
    ] : []),
    // Conditional: EM for Admin/Super/RM (SADMIN, ADMIN, RELMNG)
    ...( (roleCode === 'SADMIN' || roleCode === 'ADMIN' || roleCode === 'RELMNG') ? [
      {
        key: 'assigned_to_em',
        header: 'Assigned EM',
        width: '180px',
        render: (l: Lead) => <span className="text-xs text-zinc-500">{getEmLabel(l.assigned_to_em)}</span>,
      }
    ] : []),
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
              <Link to={`/leads/${lead.uuid}`}>
                <DropdownMenuItem className="cursor-pointer gap-2 py-2">
                  <Eye className="h-4 w-4 text-zinc-500" />
                  <span>View Details</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem onClick={() => onEdit(lead)} className="cursor-pointer gap-2 py-2">
                <Pencil className="h-4 w-4 text-blue-500" />
                <span>Edit Lead</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onScheduleVisit(lead)} className="cursor-pointer gap-2 py-2">
                <CalendarClock className="h-4 w-4 text-emerald-500" />
                <span>Schedule Visit</span>
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
      isLoading={isLoading || isLookupLoading}
      page={page}
      limit={limit}
      total={total}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
      rowKey={(l) => l.uuid}
      sortField={sortField}
      sortOrder={sortOrder}
      onSort={onSort as any}
      offset={offset}
    />
  );
};
