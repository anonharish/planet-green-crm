import React from 'react';
import { DataTable } from '../../../shared/components/DataTable/DataTable';
import { usePermissions } from '../../../hooks/usePermissions';
import { Pencil, Trash2, MoreVertical, User as UserIcon, Calendar, MapPin } from 'lucide-react';
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
import { PERMISSIONS } from '../../../config/permissions';

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
}: LeadTableProps) => {
  const { can } = usePermissions();

  const formatDate = (dateString?: string) => {
    if (!dateString) return '---';
    return new Date(dateString).toLocaleDateString();
  };

  const columns: ColumnDef<Lead>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (lead) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
            <UserIcon className="h-4 w-4" />
          </div>
          <div>
            <div className="font-medium text-zinc-900 dark:text-zinc-100">
              {lead.first_name} {lead.last_name}
            </div>
            <div className="text-xs text-zinc-500">{lead.email_address}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (lead) => (
        <div className="flex items-center gap-2 text-zinc-500">
          <MapPin className="h-3 w-3" />
          <span className="text-xs truncate max-w-[150px]">
            {lead.city}, {lead.state}
          </span>
        </div>
      ),
    },
    {
      key: 'assignment',
      header: 'Assignments',
      render: (lead) => (
        <div className="space-y-1">
          <div className="text-[10px] text-zinc-400 uppercase tracking-wider">RM ID: {lead.assigned_to_rm || '---'}</div>
          <div className="text-[10px] text-zinc-400 uppercase tracking-wider">EM ID: {lead.assigned_to_em || '---'}</div>
        </div>
      ),
    },
    {
      key: 'created_on',
      header: 'Created',
      render: (lead) => (
        <div className="flex items-center gap-2 text-zinc-500">
          <Calendar className="h-3.5 w-3.5" />
          <span className="text-xs">{formatDate(lead.created_on)}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (lead) => {
        // Mock status badge for now until we have status codes
        return (
          <Badge variant="outline" className="text-[10px] py-0 px-2 font-bold uppercase tracking-wider bg-zinc-50 dark:bg-zinc-900">
            Status {lead.lead_status_id}
          </Badge>
        );
      },
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
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs font-normal text-zinc-500 uppercase px-3 py-2">
                Lead Actions
              </DropdownMenuLabel>
              
              <DropdownMenuItem onClick={() => onEdit(lead)} className="cursor-pointer gap-2">
                <Pencil className="h-4 w-4 text-blue-500" />
                <span>Edit Lead</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={() => onDelete(lead.uuid)} 
                className="cursor-pointer gap-2 text-red-600 focus:text-red-600"
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
    />
  );
};
