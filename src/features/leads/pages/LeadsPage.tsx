import React, { useState } from 'react';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { FilterBar, SearchInput } from '../../../shared/components/FilterBar/FilterBar';
import { AppDrawer } from '../../../shared/components/AppDrawer/AppDrawer';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog/ConfirmDialog';
import { LeadForm } from '../components/LeadForm';
import { LeadTable } from '../components/LeadTable';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { toast } from 'sonner';
import { 
  useGetLeadsQuery, 
  useCreateLeadMutation, 
  useUpdateLeadMutation,
  useBulkAssignLeadsToRmMutation,
} from '../api/leadsApi';
import { useGetAllMasterDataQuery } from '../../master/api/masterApi';
import { useGetAllUsersByRoleIdQuery, useGetReporteesQuery } from '../../users/api/usersApi';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import { MultiSelect } from '../../../components/ui/multi-select';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { useAppSelector } from '../../../app/hooks';
import type { Lead, CreateLeadRequest } from '../types';

export const LeadsPage = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20); // Local limit for display (10, 20, 50)
  
  // Selection state
  const [selectedUuids, setSelectedUuids] = useState<string[]>([]);
  const [targetRmId, setTargetRmId] = useState<string>('');

  const { currentRole } = useAppSelector((state) => state.auth);
  const isAdmin = currentRole?.code === 'ADMIN' || currentRole?.code === 'SADMIN';

  // Filter state
  const [search, setSearch] = useState('');
  const [statusIds, setStatusIds] = useState<string[]>([]);
  const [projectIds, setProjectIds] = useState<string[]>([]);
  const [rmId, setRmId] = useState<string>('all');
  const [emId, setEmId] = useState<string>('all');

  // Calculate server-side offset based on local page/limit
  // We fetch in chunks of 200
  const serverOffset = Math.floor(((page - 1) * limit) / 200) * 200;

  // Debouncing for efficient API calls
  const debouncedSearch = useDebounce(search, 500);
  const debouncedFilters = useDebounce({ statusIds, projectIds, rmId, emId }, 300);
  
  // Sorting state
  const [sortField, setSortField] = useState<string>('created_on');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [deleteUuid, setDeleteUuid] = useState<string | null>(null);

  // Data Fetching
  const { data: masterData } = useGetAllMasterDataQuery();
  const { data: rms = [] } = useGetAllUsersByRoleIdQuery({ role_id: 3, offset: 0 });
  const { data: ems = [] } = useGetReporteesQuery(
    { reporting_manager_id: Number(rmId), offset: 0 },
    { skip: rmId === 'all' }
  );

  const { data: leads = [], isLoading, isFetching } = useGetLeadsQuery({ 
    offset: serverOffset,
    search_text: debouncedSearch || undefined,
    status: debouncedFilters.statusIds.length > 0 ? debouncedFilters.statusIds.map(Number) : undefined,
    project: debouncedFilters.projectIds.length > 0 ? debouncedFilters.projectIds.map(Number) : undefined,
    rm: debouncedFilters.rmId !== 'all' ? [Number(debouncedFilters.rmId)] : undefined,
    em: debouncedFilters.emId !== 'all' ? [Number(debouncedFilters.emId)] : undefined,
  });

  const [createLead, { isLoading: isCreating }] = useCreateLeadMutation();
  const [updateLead, { isLoading: isUpdating }] = useUpdateLeadMutation();
  const [bulkAssign, { isLoading: isBulkAssigning }] = useBulkAssignLeadsToRmMutation();

  const handleResetFilters = () => {
    setSearch('');
    setStatusIds([]);
    setProjectIds([]);
    setRmId('all');
    setEmId('all');
  };

  const handleBulkAssign = async () => {
    if (!targetRmId || selectedUuids.length === 0) return;
    try {
      await bulkAssign({
        lead_uuids: selectedUuids,
        assigned_to_rm: Number(targetRmId)
      }).unwrap();
      toast.success('Leads successfully assigned to RM');
      setSelectedUuids([]);
      setTargetRmId('');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Bulk assignment failed');
    }
  };

  const handleCreateNew = () => {
    setEditingLead(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setIsDrawerOpen(true);
  };

  const handleDelete = (uuid: string) => {
    setDeleteUuid(uuid);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleFormSubmit = async (values: CreateLeadRequest) => {
    try {
      if (editingLead) {
        await updateLead({ ...values, uuid: editingLead.uuid }).unwrap();
        toast.success('Lead updated successfully');
      } else {
        await createLead(values).unwrap();
        toast.success('Lead created successfully');
      }
      setIsDrawerOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Operation failed');
    }
  };

  // Local Sort logic (Filters are now server-side)
  const sortedLeads = React.useMemo(() => {
    let result = [...leads];
    
    result.sort((a, b) => {
      let valA: any = (a as any)[sortField];
      let valB: any = (b as any)[sortField];

      if (sortField === 'created_on') {
        valA = a.created_on ? new Date(a.created_on).getTime() : 0;
        valB = b.created_on ? new Date(b.created_on).getTime() : 0;
      } else {
        valA = typeof valA === 'string' ? valA.toLowerCase() : valA ?? '';
        valB = typeof valB === 'string' ? valB.toLowerCase() : valB ?? '';
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [leads, sortField, sortOrder]);

  const statusOptions = (masterData?.lead_statuses || []).map(s => ({ label: s.description, value: String(s.id) }));
  const projectOptions = (masterData?.projects || []).map(p => ({ label: p.description, value: String(p.id) }));

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Manage Leads" 
        description="View and manage all incoming customer leads"
        actions={
          <Button onClick={handleCreateNew}>
            Add Lead
          </Button>
        }
      />

      <div className="border rounded-lg p-4 bg-white dark:bg-zinc-950 shadow-sm space-y-4">
        <FilterBar onReset={handleResetFilters}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search leads..." />
          
          <div className="w-48">
            <MultiSelect 
              options={statusOptions} 
              selected={statusIds} 
              onChange={setStatusIds} 
              placeholder="Filter Status"
            />
          </div>

          <div className="w-48">
            <MultiSelect 
              options={projectOptions} 
              selected={projectIds} 
              onChange={setProjectIds} 
              placeholder="Filter Project"
            />
          </div>

          <Select value={rmId} onValueChange={(val) => { setRmId(val); setEmId('all'); }}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select RM" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All RMs</SelectItem>
              {rms.map(r => (
                <SelectItem key={r.id} value={String(r.id)}>{r.first_name} {r.last_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={emId} onValueChange={setEmId} disabled={rmId === 'all'}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select EM" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All EMs</SelectItem>
              {ems.map(e => (
                <SelectItem key={e.id} value={String(e.id)}>{e.first_name} {e.last_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterBar>

        {/* Bulk Action Panel */}
        {isAdmin && selectedUuids.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 border rounded-md animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {selectedUuids.length} leads selected
              </span>
              <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-2" />
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Bulk Assign to RM:</span>
                <Select value={targetRmId} onValueChange={setTargetRmId}>
                  <SelectTrigger className="w-48 h-9 shadow-none">
                    <SelectValue placeholder="Choose Relationship Manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {rms.map(r => (
                      <SelectItem key={r.id} value={String(r.id)}>{r.first_name} {r.last_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  size="sm" 
                  disabled={!targetRmId || isBulkAssigning} 
                  onClick={handleBulkAssign}
                  className="h-9 px-4"
                >
                  {isBulkAssigning ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Assign Now
                </Button>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedUuids([])}
              className="text-zinc-500 hover:text-zinc-800"
            >
              Cancel
            </Button>
          </div>
        )}

        <LeadTable 
          data={sortedLeads} // Pass the sorted buffer, LeadTable/DataTable handles slicing
          isLoading={isLoading || isFetching}
          page={page}
          limit={limit}
          // If we have 200 leads, assume there might be more to enable "Next"
          total={leads.length < 200 ? serverOffset + leads.length : serverOffset + 201}
          onPageChange={setPage}
          onLimitChange={setLimit}
          onEdit={handleEdit}
          onDelete={handleDelete}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
          selectedUuids={selectedUuids}
          onSelectUuids={setSelectedUuids}
          offset={serverOffset}
        />
      </div>

      <AppDrawer
        title={editingLead ? 'Edit Lead' : 'Create New Lead'}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      >
        {isDrawerOpen && (
          <LeadForm 
            onSubmit={handleFormSubmit}
            isLoading={isCreating || isUpdating}
            isEdit={!!editingLead}
            initialValues={editingLead || undefined}
          />
        )}
      </AppDrawer>

      <ConfirmDialog
        open={!!deleteUuid}
        onClose={() => setDeleteUuid(null)}
        onConfirm={async () => {
          toast.info('Delete functionality pending API');
          setDeleteUuid(null);
        }}
        title="Delete Lead"
        description="Are you sure you want to delete this lead? This action cannot be undone."
      />
    </div>
  );
};
