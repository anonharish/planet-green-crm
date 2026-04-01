import React from 'react';
import type { JunkLead } from '../data/junkLeadsData';
import { junkLeads } from '../data/junkLeadsData';
import { DataTable } from '../../../shared/components/DataTable/DataTable';
import type { ColumnDef } from '../../../shared/components/DataTable/DataTable';
import { Button } from '../../../components/ui/button';
import { ArrowUpRight } from 'lucide-react';

interface JunkLeadsPageProps {
  onVerify: (lead: JunkLead) => void;
}

export const JunkLeadsPage: React.FC<JunkLeadsPageProps> = ({ onVerify }) => {
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);

  const columns: ColumnDef<JunkLead>[] = [
    {
      key: 'lead_id',
      header: 'Lead ID',
      width: '120px',
      render: (l) => <span className="text-zinc-500 font-medium">#{l.lead_id}</span>,
    },
    {
      key: 'customer_name',
      header: 'Customer Name',
      render: (l) => (
        <div className="flex flex-col">
          <span className="font-bold text-zinc-900 dark:text-zinc-100">{l.customer_name}</span>
          <span className="text-[11px] text-zinc-400 font-medium">{l.phone_number}</span>
        </div>
      ),
    },
    {
      key: 'project',
      header: 'Project',
      render: (l) => <span className="text-zinc-600 dark:text-zinc-400 font-medium">{l.project}</span>,
    },
    {
      key: 'relationship_manager',
      header: 'Relationship Manager',
      render: (l) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#0f3d6b] flex items-center justify-center text-[11px] font-bold text-white uppercase shadow-sm">
            {l.relationship_manager.initials}
          </div>
          <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {l.relationship_manager.name}
          </span>
        </div>
      ),
    },
    {
      key: 'junk_reason',
      header: 'Junk Reason',
      render: (l) => (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200/50">
          {l.junk_reason}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '100px',
      render: (l) => (
        <Button 
          variant="default" 
          size="sm" 
          className="bg-[#0f3d6b] hover:bg-[#0c3156] text-white font-extrabold h-9 px-6 rounded-lg shadow-sm transition-all active:scale-95"
          onClick={() => onVerify(l)}
        >
          Verify
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-4xl font-black text-[#0f3d6b] tracking-tight">Manage Junks</h1>
        <p className="text-zinc-500 font-medium">Streamline and audit the junk lead restoration process</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white dark:bg-zinc-950 p-8 rounded-[2.5rem] border border-zinc-200/60 dark:border-zinc-800/60 relative overflow-hidden group shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
          <div className="relative z-10 space-y-4">
            <span className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em]">Pending Reviews</span>
            <div className="flex items-baseline gap-3">
              <span className="text-7xl font-black text-[#0f3d6b]">124</span>
              <span className="text-zinc-400 text-xl font-bold">Leads</span>
            </div>
            <p className="text-zinc-500 text-base leading-relaxed max-w-lg font-medium">
              High-density queue of potential false-negatives marked by Relationship Managers. Verify to restore them to the active pipeline.
            </p>
          </div>
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <div className="w-40 h-40 bg-[#0f3d6b] rounded-full blur-[60px]" />
          </div>
        </div>

        <div className="lg:col-span-4 bg-white dark:bg-zinc-950 p-8 rounded-[2.5rem] border border-zinc-200/60 dark:border-zinc-800/60 flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
          <div className="space-y-4">
            <span className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em]">Accuracy Rate</span>
            <div className="text-6xl font-black text-zinc-900 dark:text-white tracking-tighter">92.4%</div>
          </div>
          <div className="flex items-center gap-2 text-emerald-500 font-black text-sm bg-emerald-50 dark:bg-emerald-500/10 w-fit px-4 py-2 rounded-full mt-6">
            <ArrowUpRight size={18} strokeWidth={3} />
            <span>+2.1% from last week</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 rounded-[2.5rem] border border-zinc-200/60 dark:border-zinc-800/60 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
        <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/30 dark:bg-zinc-900/10">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">Active Junk Leads Queue</h2>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.4)]" />
          </div>
          <Button className="bg-[#1e293b] hover:bg-[#0f172a] text-white font-black px-8 py-6 rounded-2xl shadow-lg transition-all hover:translate-y-[-2px] active:translate-y-0">
            Bulk Verify Leads
          </Button>
        </div>
        <div className="p-6">
          <DataTable
            columns={columns}
            data={junkLeads}
            page={page}
            limit={limit}
            total={junkLeads.length}
            onPageChange={setPage}
            onLimitChange={setLimit}
            rowKey={(l) => l.uuid}
          />
        </div>
      </div>
    </div>
  );
};
