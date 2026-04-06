import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from '../../../components/ui/dialog';
import { useGetLeadsByEmIdQuery } from '../../leads/api/leadsApi';
import { useMasterDataLookup } from '../../../shared/hooks/useMasterDataLookup';
import { Loader2, Layout, X } from 'lucide-react';
import { DataTable } from '../../../shared/components/DataTable/DataTable';
import { cn } from '../../../utils';
import type { User as UserType } from '../types';
import type { ColumnDef } from '../../../shared/components/DataTable/DataTable';
import type { Lead } from '../../leads/types';

interface UserLeadsDialogProps {
  open: boolean;
  onClose: () => void;
  user: UserType | null;
}

const InitialsBadge = ({ name, colorClass }: { name?: string; colorClass: string }) => {
  if (!name) return <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-[10px] font-bold text-zinc-400 border border-zinc-200">--</div>;
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold shadow-xs border border-white/20", colorClass)}>
      {initials}
    </div>
  );
};

export const UserLeadsDialog = ({
  open,
  onClose,
  user
}: UserLeadsDialogProps) => {
  const [page, setPage] = useState(1);
  const limit = 10;
  const { getStatusLabel, getProjectLabel, getSourceLabel, getRmLabel, isLoading: isLookupLookup } = useMasterDataLookup();

  // Fetch leads for this EM
  const { data: leads = [], isLoading, isFetching } = useGetLeadsByEmIdQuery(
    { assigned_to_em: user?.id || 0, offset: (page - 1) * limit },
    { skip: !open || !user?.id }
  );

  const columns: ColumnDef<Lead>[] = [
    {
      key: 'lead_id',
      header: 'LEAD ID',
      width: '120px',
      render: (lead) => (
        <span className="font-bold text-zinc-400 dark:text-zinc-600 text-xs tracking-tight">
          PG{lead.lead_id}
        </span>
      ),
    },
    {
      key: 'lead_name',
      header: 'LEAD NAME',
      width: '240px',
      render: (lead) => (
        <div className="flex items-center gap-3">
          <InitialsBadge name={`${lead.first_name} ${lead.last_name}`} colorClass="bg-[#E9ECEF] text-[#495057]" />
          <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm tracking-tight whitespace-nowrap">
            {lead.first_name} {lead.last_name}
          </span>
        </div>
      ),
    },
    {
      key: 'project_id',
      header: 'PROJECT INTEREST',
      width: '200px',
      render: (lead) => (
        <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm tracking-tight">
          {getProjectLabel(lead.project_id)}
        </span>
      ),
    },
    {
      key: 'source_id',
      header: 'SOURCE',
      width: '140px',
      render: (lead) => (
        <div className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full inline-flex border border-zinc-200 dark:border-zinc-700">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">
            {getSourceLabel(lead.source_id)}
          </span>
        </div>
      ),
    },
    {
      key: 'lead_status_id',
      header: 'CURRENT STAGE',
      width: '160px',
      render: (lead) => (
        <div className="px-4 py-1 border border-zinc-200 dark:border-zinc-800 rounded-full inline-flex bg-white dark:bg-zinc-900 shadow-xs">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">
            {getStatusLabel(lead.lead_status_id)}
          </span>
        </div>
      ),
    },
    {
      key: 'assigned_to_rm',
      header: 'ASSIGNE',
      width: '80px',
      render: (lead) => {
        const rmLabel = getRmLabel(lead.assigned_to_rm);
        return (
          <div className="flex items-center justify-center">
            <InitialsBadge 
              name={rmLabel === '--' ? undefined : rmLabel} 
              colorClass={rmLabel === '--' ? "bg-zinc-100 text-zinc-400" : "bg-[#212529] text-white"} 
            />
          </div>
        );
      },
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl overflow-hidden flex flex-col p-0 gap-0 border-none shadow-3xl bg-white dark:bg-zinc-950 rounded-[28px]">
        {/* Header Section */}
        <div className="px-12 pt-12 pb-6 flex items-center justify-between relative">
          <div>
            <DialogTitle className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-1">
              Lead Registry
            </DialogTitle>
            <p className="text-sm text-zinc-400 dark:text-zinc-500 font-medium">
              Listing leads for <span className="text-zinc-900 dark:text-zinc-100">{user?.first_name} {user?.last_name}</span>
            </p>
          </div>
        </div>

        {/* List Section */}
        <div className="flex-1 overflow-visible bg-white dark:bg-zinc-950 px-6">
          {isLoading || isFetching || isLookupLookup ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4 text-zinc-300">
              <Loader2 className="h-10 w-10 animate-spin text-zinc-200" />
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400">Loading Registry...</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-32 px-10">
              <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-zinc-200 dark:border-zinc-800 transition-all">
                <Layout className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                No Leads Assigned
              </h3>
              <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-2 max-w-[280px] mx-auto font-medium leading-relaxed">
                This experience manager currently has no active leads assigned to them in the registry.
              </p>
            </div>
          ) : (
            <DataTable
              columns={columns as any}
              data={leads}
              isLoading={isLoading}
              page={page}
              limit={limit}
              total={leads.length}
              onPageChange={setPage}
              onLimitChange={() => {}}
              rowKey={(l) => l.uuid}
              variant="embed"
            />
          )}
        </div>

        {/* Spacing for aesthetic */}
        <div className="h-4" />
      </DialogContent>
    </Dialog>
  );
};
