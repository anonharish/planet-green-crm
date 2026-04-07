import React, { useState } from 'react';
import { DataTable } from '../../../shared/components/DataTable/DataTable';
import type { ColumnDef } from '../../../shared/components/DataTable/DataTable';
import { Button } from '../../../components/ui/button';
import type { Lead } from '../types';
import { useMasterDataLookup } from '../../../shared/hooks/useMasterDataLookup';
import { Link } from 'react-router-dom';
import { useGetLeadsQuery } from '../api/leadsApi';
import { useGetAllMasterDataQuery } from '../../master/api/masterApi';
import { SearchInput } from '../../../shared/components/FilterBar/FilterBar';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import { Loader2 } from 'lucide-react';

interface JunkLeadsPageProps {
  onVerify: (lead: Lead) => void;
}

export const InitialsAvatar = ({ firstName, lastName }: { firstName?: string; lastName?: string }) => {
  const initials = `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase() || '?';
  return (
    <div className="h-6 w-6 rounded-4xl bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 flex items-center justify-center font-bold shrink-0 text-[10px]">
      {initials}
    </div>
  );
};

export const JunkLeadsPage: React.FC<JunkLeadsPageProps> = ({ 
  onVerify 
}) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  const { data: masterData } = useGetAllMasterDataQuery();
  const junkStatus = masterData?.lead_statuses?.find(s => s.code === 'JUNKPE');
  
  const { 
    data: leads = [], 
    isLoading, 
    isFetching 
  } = useGetLeadsQuery({
    offset: (page - 1) * limit,
    search_text: debouncedSearch || undefined,
    status: junkStatus ? [junkStatus.id] : undefined,
  }, { 
    skip: !junkStatus 
  });

  const { 
    getStatusLabel, 
    getProjectLabel, 
    getRmLabel, 
    getSourceLabel 
  } = useMasterDataLookup();

  // For server-side pagination with partial data, assume more if 200 chunk is full
  // But wait, the DataTable expects a total. If we don't have a real total from API, 
  // we might need to adjust. GetLeadsResponse is just an array.
  // The backend might not return total. Let's see LeadsPage.tsx's total calculation.
  // totalLeads = leads.length < 200 ? serverOffset + leads.length : serverOffset + 201;
  const total = leads.length < limit ? (page - 1) * limit + leads.length : (page - 1) * limit + limit + 1;

  const fallback = (value: React.ReactNode) => value ?? '--';

  const columns: ColumnDef<Lead>[] = [
    {
      key: 'lead_id',
      header: 'LEAD ID',
      width: '110px',
      render: (l: Lead) => (
        <Link 
          to={`/leads/${l.uuid}`} 
          className="text-secondary-foreground font-semibold hover:text-primary transition-colors text-xs"
        >
          #{fallback(l.lead_id)}
        </Link>
      ),
    },
    {
      key: 'customer_name',
      header: 'CUSTOMER NAME',
      width: '150px',
      render: (l: Lead) => (
        <span className="font-bold text-primary text-xs">
          {fallback(l.first_name)} {l.last_name || ''}
        </span>
      ),
    },
    {
      key: 'contact_details',
      header: 'CONTACT DETAILS',
      width: '150px',
      render: (l: Lead) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-zinc-800 dark:text-zinc-100 font-medium text-xs">{fallback(l.phone_number)}</span>
          <span className="text-zinc-400 text-[11px] truncate">{l.email_address || '--'}</span>
        </div>
      ),
    },
    {
      key: 'source_id',
      header: 'SOURCE',
      width: '140px',
      render: (l: Lead) => (
        <span className="inline-block px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
          {getSourceLabel(l.source_id).split(' ')[0]}
        </span>
      ),
    },
    {
      key: 'project_id',
      header: 'PROJECT',
      width: '150px',
      render: (l: Lead) => (
        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
          {getProjectLabel(l.project_id)}
        </span>
      ),
    },
    {
      key: 'lead_status_id',
      header: 'STATUS',
      width: '130px',
      render: (l: Lead) => (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200/50">
          {getStatusLabel(l.lead_status_id)}
        </span>
      ),
    },
    {
      key: 'assigned_to_rm',
      header: 'ASSIGNED RM',
      width: '180px',
      render: (l: Lead) => {
        const label = getRmLabel(l.assigned_to_rm);
        if (label === '--') return <span className="text-zinc-400 text-xs italic">Unassigned</span>;
        return (
          <div className="flex items-center gap-2">
            <InitialsAvatar firstName={label.split(' ')[0]} lastName={label.split(' ')[1]} />
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
          </div>
        );
      },
    },
    {
      key: 'junk_reason',
      header: 'JUNK REASON',
      width: '200px',
      render: (l: Lead) => (
        <div className="max-w-[180px] truncate">
          <span 
            className="text-zinc-600 dark:text-zinc-400 font-medium text-[11px] tracking-tight" 
            title={l.junk_reason || 'No reason provided'}
          >
            {l.junk_reason || '--'}
          </span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'ACTIONS',
      width: '120px',
      render: (l: Lead) => (
        <Button 
          variant="default" 
          size="sm" 
          className="bg-[#0f3d6b] hover:bg-[#0c3156] text-white font-extrabold h-8 px-4 rounded-lg shadow-sm transition-all active:scale-95 text-[10px] uppercase tracking-wider"
          onClick={() => onVerify(l)}
        >
          Verify Lead
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-black text-[#0f3d6b] tracking-tight">Manage Junks</h1>
        <p className="text-zinc-500 font-medium text-sm">Streamline and audit the junk lead restoration process</p>
      </div>

      <div className="bg-white dark:bg-zinc-950 rounded-4xl border border-zinc-200/60 dark:border-zinc-800/60 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
        <div className="px-8 py-5 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50/30 dark:bg-zinc-900/10">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100 tracking-tight">Active Junk Leads Queue</h2>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            {(isLoading || isFetching) && <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />}
          </div>
          <div className="w-full sm:w-64">
            <SearchInput
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search by name..."
            />
          </div>
        </div>
        <div className="p-4">
          <DataTable
            columns={columns}
            data={leads}
            isLoading={isLoading}
            page={page}
            limit={limit}
            total={total}
            onPageChange={setPage}
            onLimitChange={(v) => {
              setLimit(v);
              setPage(1);
            }}
            rowKey={(l) => l.uuid}
          />
        </div>
      </div>
    </div>
  );
};
