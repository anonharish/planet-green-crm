import React from 'react';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { DataTable } from '../../../shared/components/DataTable/DataTable';
import type { ColumnDef } from '../../../shared/components/DataTable/DataTable';
import { useGetLeadsByEmIdQuery } from '../../leads/api/leadsApi';
import { useMasterDataLookup } from '../../../shared/hooks/useMasterDataLookup';
import type { Lead } from '../../leads/types';
import type { User } from '../types';
import { cn } from '../../../utils';

interface UserLeadsDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

const getInitials = (first?: string | null, last?: string | null) => {
  return `${(first?.[0] || '').toUpperCase()}${(last?.[0] || '').toUpperCase()}`;
};

export const UserLeadsDialog = ({
  open,
  onClose,
  user,
}: UserLeadsDialogProps) => {
  const navigate = useNavigate();
  const { getStatusLabel, getSourceLabel, getProjectLabel, getRmLabel } = useMasterDataLookup();

  const { data: leads = [], isLoading } = useGetLeadsByEmIdQuery(
    { assigned_to_em: user?.id || 0, offset: 0 },
    { skip: !user?.id || !open }
  );

  const columns: ColumnDef<Lead>[] = [
    {
      key: 'lead_id',
      header: 'LEAD ID',
      width: '120px',
      render: (l) => (
        <span className="text-zinc-400 font-medium text-xs">
          {l.lead_id}
        </span>
      )
    },
    {
      key: 'name',
      header: 'LEAD NAME',
      width: '200px',
      render: (l) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">
            {getInitials(l.first_name, l.last_name)}
          </div>
          <span className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">
            {l.first_name} {l.last_name}
          </span>
        </div>
      )
    },
    {
      key: 'project',
      header: 'PROJECT INTEREST',
      width: '220px',
      render: (l) => (
        <div className="flex flex-col">
          <span className="font-bold text-zinc-800 dark:text-zinc-200 text-xs">{getProjectLabel(l.project_id)}</span>
        </div>
      )
    },
    {
      key: 'source',
      header: 'SOURCE',
      width: '140px',
      render: (l) => (
        <Badge variant="outline" className="text-[10px] py-1 px-3 font-bold uppercase rounded-full border-zinc-200 text-zinc-500 bg-zinc-50/50">
          {getSourceLabel(l.source_id)}
        </Badge>
      )
    },
    {
      key: 'stage',
      header: 'CURRENT STAGE',
      width: '160px',
      render: (l) => {
        const label = getStatusLabel(l.lead_status_id);
        const statusColors: Record<string, string> = {
          'Negotiation': 'bg-blue-50 text-blue-600 border-blue-100',
          'Closed': 'bg-teal-50 text-teal-600 border-teal-100',
          'Discovery': 'bg-zinc-100 text-zinc-600 border-zinc-200',
          'Rejected': 'bg-red-50 text-red-600 border-red-100',
          'Interested': 'bg-indigo-50 text-indigo-600 border-indigo-100',
        };
        const colorClass = statusColors[label] || 'bg-zinc-50 text-zinc-500 border-zinc-200';
        
        return (
          <Badge variant="outline" className={cn("text-[10px] py-1 px-4 font-bold uppercase rounded-full border shadow-none", colorClass)}>
            {label}
          </Badge>
        );
      }
    },
    {
      key: 'rm',
      header: 'ASSIGNED RM',
      width: '200px',
      render: (l) => {
        const label = getRmLabel(l.assigned_to_rm);
        return (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-white shrink-0 uppercase">
              {label !== '--' ? getInitials(label.split(' ')[0], label.split(' ')[1]) : '??'}
            </div>
            <span className="text-zinc-600 dark:text-zinc-400 font-medium text-xs">
              {label}
            </span>
          </div>
        );
      }
    },
    {
      key: 'actions',
      header: 'ACTIONS',
      width: '120px',
      render: (l) => (
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-[11px] font-bold uppercase rounded-xl border-zinc-200 dark:border-zinc-800 text-primary hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all px-4 shadow-none"
          onClick={() => {
            onClose();
            navigate(`/leads/${l.uuid}`);
          }}
        >
          View Lead
        </Button>
      )
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[1000px] max-h-[90vh] flex flex-col p-8 gap-8 bg-white dark:bg-zinc-950 rounded-[32px] overflow-hidden">
        <DialogHeader className="p-0">
          <DialogTitle className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Lead Registry
          </DialogTitle>
          <p className="text-sm text-zinc-500 mt-1">Listing leads for {user ? `${user.first_name} ${user.last_name}` : 'Experience Manager'}</p>
        </DialogHeader>

        <div className="flex-1 overflow-auto min-h-0 -mx-4 px-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p className="text-sm">Fetching Lead Registry...</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="flex items-center justify-center h-64 border-2 border-dashed border-zinc-100 rounded-[32px]">
              <p className="text-zinc-400">No leads associated with this experience manager.</p>
            </div>
          ) : (
            <DataTable
              columns={columns as any}
              data={leads}
              isLoading={isLoading}
              page={1}
              limit={leads.length}
              total={leads.length}
              onPageChange={() => {}}
              onLimitChange={() => {}}
              rowKey={(l) => l.uuid}
              variant="embed"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
