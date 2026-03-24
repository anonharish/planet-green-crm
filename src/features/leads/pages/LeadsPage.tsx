import React, { useState } from 'react';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { FilterBar, SearchInput } from '../../../shared/components/FilterBar/FilterBar';
import { AppDrawer } from '../../../shared/components/AppDrawer/AppDrawer';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog/ConfirmDialog';
import { LeadForm } from '../components/LeadForm';
import { LeadTable } from '../components/LeadTable';
import { Plus, UserPlus } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { toast } from 'sonner';
import { 
  useGetLeadsQuery, 
  useCreateLeadMutation, 
  useUpdateLeadMutation 
} from '../api/leadsApi';
import type { Lead, CreateLeadRequest } from '../types';

export const LeadsPage = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(200); // Fixed at 200 per user request
  const [search, setSearch] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [deleteUuid, setDeleteUuid] = useState<string | null>(null);

  const { data: leads = [], isLoading, isFetching } = useGetLeadsQuery({ 
    offset: (page - 1) * limit 
  });

  const [createLead, { isLoading: isCreating }] = useCreateLeadMutation();
  const [updateLead, { isLoading: isUpdating }] = useUpdateLeadMutation();

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

  // Filter leads locally for search (since API doesn't have search params yet)
  const filteredLeads = leads.filter(lead => {
    const fullName = `${lead.first_name} ${lead.last_name}`.toLowerCase();
    const query = search.toLowerCase();
    return fullName.includes(query) || lead.email_address?.toLowerCase().includes(query);
  });

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Manage Leads" 
        description="View and manage all incoming customer leads"
        actions={
          <Button onClick={handleCreateNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Lead
          </Button>
        }
      />

      <div className="border rounded-lg p-4 bg-white dark:bg-zinc-950 shadow-sm space-y-4">
        <FilterBar onReset={() => setSearch('')}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search leads by name or email..." />
        </FilterBar>

        <LeadTable 
          data={filteredLeads}
          isLoading={isLoading || isFetching}
          page={page}
          limit={limit}
          total={leads.length} // Local total for now
          onPageChange={setPage}
          onLimitChange={setLimit}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <AppDrawer
        title={editingLead ? 'Edit Lead' : 'Create New Lead'}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      >
        <LeadForm 
          onSubmit={handleFormSubmit}
          isLoading={isCreating || isUpdating}
          isEdit={!!editingLead}
          initialValues={editingLead || undefined}
        />
      </AppDrawer>

      <ConfirmDialog
        open={!!deleteUuid}
        onClose={() => setDeleteUuid(null)}
        onConfirm={async () => {
          // No delete API provided yet, but setup for future
          toast.info('Delete functionality pending API');
          setDeleteUuid(null);
        }}
        title="Delete Lead"
        description="Are you sure you want to delete this lead? This action cannot be undone."
      />
    </div>
  );
};
