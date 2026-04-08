import React, { useState } from 'react';
import { Loader2, Layout, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { useGetLeadsByCustomerUuidQuery } from '../../leads/api/leadsApi';
import { useMasterDataLookup } from '../../../shared/hooks/useMasterDataLookup';
import { DataTable } from '../../../shared/components/DataTable/DataTable';
import { cn } from '../../../utils';
import type { ColumnDef } from '../../../shared/components/DataTable/DataTable';
import type { Lead } from '../../leads/types';

interface CustomerLeadsDialogProps {
  open: boolean;
  onClose: () => void;
  customerUuid: string | null;
  customerName?: string;
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

export const CustomerLeadsDialog = ({
  open,
  onClose,
  customerUuid,
  customerName,
}: CustomerLeadsDialogProps) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 10;
  const { getStatusLabel, getProjectLabel, getSourceLabel, isLoading: isLookupLookup } = useMasterDataLookup();

  const { data, isLoading, isError } = useGetLeadsByCustomerUuidQuery(
    { customer_uuid: customerUuid || '', offset: (page - 1) * limit },
    { skip: !customerUuid || !open }
  );

  const leads = data || [];

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
      width: '200px',
      render: (lead) => (
        <div className="flex items-center gap-3">
          <InitialsBadge name={`${lead.first_name || ''} ${lead.last_name || ''}`.trim()} colorClass="bg-[#E9ECEF] text-[#495057]" />
          <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm tracking-tight whitespace-nowrap">
            {lead.first_name} {lead.last_name}
          </span>
        </div>
      ),
    },
    {
      key: 'project_id',
      header: 'PROJECT INTEREST',
      width: '180px',
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
      key: 'actions',
      header: 'ACTION',
      width: '160px',
      render: (lead) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            onClose();
            navigate(`/leads/${lead.uuid}`);
          }}
          className="h-8 text-[11px] font-bold uppercase rounded-xl border-zinc-200 dark:border-zinc-800 text-primary hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all px-4 shadow-none"
        >
          View Lead Details
        </Button>
      ),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl overflow-hidden flex flex-col p-0 gap-0 border-none shadow-3xl bg-white dark:bg-zinc-950 rounded-[28px]">
        {/* Header Section */}
        <div className="px-12 pt-12 pb-6 flex items-center justify-between relative">
          <div>
            <DialogTitle className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-1">
              Lead Registry
            </DialogTitle>
            <p className="text-sm text-zinc-400 dark:text-zinc-500 font-medium">
              Listing leads for <span className="text-zinc-900 dark:text-zinc-100">{customerName}</span>
            </p>
          </div>
        </div>

        {/* Table Section */}
        <div className="flex-1 overflow-visible bg-white dark:bg-zinc-950 px-6">
          {isLoading || isLookupLookup ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4 text-zinc-300">
              <Loader2 className="h-10 w-10 animate-spin text-zinc-200" />
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400">Loading Registry...</p>
            </div>
          ) : isError ? (
            <div className="text-center py-32 text-red-500">
              Failed to load leads for this customer.
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-32 px-10">
              <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-[28px] flex items-center justify-center mx-auto mb-6 border border-zinc-200 dark:border-zinc-800 transition-all">
                <Layout className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                No Leads Found
              </h3>
              <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-2 max-w-[280px] mx-auto font-medium leading-relaxed">
                This customer currently has no active leads in the registry.
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
        <div className="h-8" />
      </DialogContent>
    </Dialog>
  );
};
