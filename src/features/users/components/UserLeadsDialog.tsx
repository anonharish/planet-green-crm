import React from 'react';
import { Loader2, User as UserIcon } from 'lucide-react';
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
import { useGetLeadsByRmIdQuery, useGetLeadsByEmIdQuery } from '../../leads/api/leadsApi';
import { useMasterDataLookup } from '../../../shared/hooks/useMasterDataLookup';
import type { Lead } from '../../leads/types';
import { cn } from '../../../utils';

interface UserLeadsDialogProps {
  open: boolean;
  onClose: () => void;
  userId: number | null;
  userName?: string;
  type: 'RM' | 'EM';
}

const getInitials = (first?: string | null, last?: string | null) => {
  return `${(first?.[0] || '').toUpperCase()}${(last?.[0] || '').toUpperCase()}`;
};

export const UserLeadsDialog = ({
  open,
  onClose,
  userId,
  userName,
  type,
}: UserLeadsDialogProps) => {
  const navigate = useNavigate();
  const { getStatusLabel, getSourceLabel, getProjectLabel, getRmLabel } = useMasterDataLookup();

  // Conditionally call the appropriate API based on user type
  const { data: rmLeads, isLoading: isRmLoading } = useGetLeadsByRmIdQuery(
    { assigned_to_rm: userId || 0, offset: 0, is_em_assigned: 0 },
    { skip: !userId || !open || type !== 'RM' }
  );

  const { data: emLeads, isLoading: isEmLoading } = useGetLeadsByEmIdQuery(
    { assigned_to_em: userId || 0, offset: 0 },
    { skip: !userId || !open || type !== 'EM' }
  );

  const leads = type === 'RM' ? (rmLeads || []) : (emLeads || []);
  const isLoading = type === 'RM' ? isRmLoading : isEmLoading;

  const columns: ColumnDef<Lead>[] = [
    {
      key: 'lead_id',
      header: 'LEAD ID',
      width: '120px',
      render: (l) => (
        <span className="text-zinc-400 font-medium text-xs">
          #{l.lead_id}
        </span>
      )
    },
    {
      key: 'name',
      header: 'LEAD NAME',
      width: '200px',
      render: (l) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-[#0f3d6b]/10 flex items-center justify-center text-[11px] font-bold text-[#0f3d6b] shrink-0">
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
        <span className="font-bold text-zinc-800 dark:text-zinc-200 text-xs">{getProjectLabel(l.project_id)}</span>
      )
    },
    {
      key: 'source',
      header: 'SOURCE',
      width: '140px',
      render: (l) => (
        <Badge variant="outline" className="text-[10px] py-1 px-3 font-bold uppercase rounded-full border-zinc-200 text-zinc-500 bg-zinc-50/50 shadow-none">
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
      key: 'actions',
      header: 'ACTIONS',
      width: '120px',
      render: (l) => (
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-[11px] font-bold uppercase rounded-xl border-zinc-200 dark:border-zinc-800 text-[#0f3d6b] hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all px-4 shadow-none"
          onClick={() => {
            onClose();
            navigate(`/leads/${l.uuid}`);
          }}
        >
          View Full Details
        </Button>
      )
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[1000px] max-h-[90vh] flex flex-col p-8 gap-8 bg-white dark:bg-zinc-950 rounded-[32px] overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-black text-[#0f3d6b] dark:text-zinc-100 tracking-tight">
                Assigned Lead Registry
              </DialogTitle>
              <p className="text-sm text-zinc-500 font-medium mt-1">
                Displaying all active leads currently handled by <span className="text-[#0f3d6b] font-bold">{userName}</span>
              </p>
            </div>
            <div className="bg-[#0f3d6b]/5 dark:bg-zinc-900 px-4 py-2 rounded-2xl border border-[#0f3d6b]/10">
              <span className="text-[10px] font-black text-[#0f3d6b] uppercase tracking-widest leading-none">
                Total {leads.length} Assignments
              </span>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto min-h-0 -mx-4 px-4 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-72 text-zinc-400">
              <Loader2 className="h-8 w-8 animate-spin text-[#0f3d6b] mb-4" />
              <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Syncing Registry...</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-72 border-2 border-dashed border-zinc-100 dark:border-zinc-900 rounded-[32px] bg-zinc-50/30 dark:bg-zinc-950/30">
               <div className="w-16 h-16 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center shadow-sm mb-4 border border-zinc-100 dark:border-zinc-800">
                <UserIcon size={24} className="text-zinc-200" />
              </div>
              <p className="text-zinc-400 font-bold text-sm">No leads assigned to this {type}.</p>
              <p className="text-xs text-zinc-300 mt-1">Assignment history will appear here once leads are linked.</p>
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

        <div className="flex justify-end pt-2">
           <Button 
            onClick={onClose} 
            className="h-12 px-10 rounded-2xl bg-[#0f3d6b] text-white font-black text-sm shadow-lg hover:bg-[#0c3156] transition-all active:scale-95"
          >
            Close Registry
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
