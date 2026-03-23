import React, { useState } from 'react';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { FilterBar, SearchInput, DateRangeFilter } from '../../../shared/components/FilterBar/FilterBar';
import { AppDrawer } from '../../../shared/components/AppDrawer/AppDrawer';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog/ConfirmDialog';
import { Button } from '../../../components/ui/button';
import { Plus } from 'lucide-react';
import { RelationshipManagerTable } from '../components/RelationshipManagerTable';
import { RelationshipManagerForm } from '../components/RelationshipManagerForm';
import { 
  useGetAllUsersByRoleIdQuery, 
  useCreateUserMutation, 
  useDeleteUserMutation 
} from '../../users/api/usersApi';
import { usePermissions } from '../../../hooks/usePermissions';
import { toast } from 'sonner';
import type { User } from '../../users/types';

export const RelationshipManagersPage = () => {
  const { can } = usePermissions();
  
  // 1. Server-side State (200 items per fetch)
  const [serverOffset, setServerOffset] = useState(0);
  
  // 2. Client-side Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  // 3. Filter/Search State
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // Queries & Mutations
  // Fetch a block of 200 users from the server
  const { data: serverUsers = [], isLoading, isFetching } = useGetAllUsersByRoleIdQuery({
    role_id: 3, // Relationship Managers only
    offset: serverOffset,
  });

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  console.log(can('manager.create'),"insideRel");

  // 4. Hybrid Logic: Client-side Search & Slicing
  const filteredData = React.useMemo(() => {
    if (!search) return serverUsers;
    const lowerSearch = search.toLowerCase();
    return serverUsers.filter((u: User) => 
      u.first_name.toLowerCase().includes(lowerSearch) || 
      u.last_name.toLowerCase().includes(lowerSearch) ||
      u.login_id.toLowerCase().includes(lowerSearch) ||
      u.email.toLowerCase().includes(lowerSearch) ||
      u.phone_number.includes(search)
    );
  }, [serverUsers, search]);

  const totalFiltered = filteredData.length;
  
  const displayData = React.useMemo(() => {
    const start = (page - 1) * limit;
    const end = start + limit;
    return filteredData.slice(start, end);
  }, [filteredData, page, limit]);

  // Adjust server offset if needed
  const handlePageChange = (newPage: number) => {
    const targetIndex = (newPage - 1) * limit;
    const newServerOffset = Math.floor(targetIndex / 200) * 200;
    if (newServerOffset !== serverOffset) {
      setServerOffset(newServerOffset);
    }
    setPage(newPage);
  };

  // Handlers
  const handleCreate = async (values: any) => {
    try {
      await createUser(values).unwrap();
      toast.success('Relationship Manager created successfully');
      setIsDrawerOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to create user');
    }
  };

  const handleDelete = async () => {
    if (!selectedUserId) return;
    try {
      await deleteUser(selectedUserId).unwrap();
      toast.success('User deleted successfully');
      setIsDeleteDialogOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete user');
    }
  };

  const actions = can('manager.create') && (
    <Button onClick={() => setIsDrawerOpen(true)}>
      <Plus className="h-4 w-4 mr-2" />
      Add Relationship Manager
    </Button>
  );

  return (
    <div className="space-y-4">
      <PageHeader 
        title="Relationship Managers" 
        description="Manage your team of relationship managers and their access levels."
        actions={actions}
      />

      <div className="border rounded-lg p-4 bg-white dark:bg-zinc-950 shadow-sm space-y-4">
        <FilterBar onReset={() => { setSearch(''); setFromDate(''); setToDate(''); }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search by name or email..." />
          <DateRangeFilter 
            fromDate={fromDate} 
            toDate={toDate} 
            onFromChange={setFromDate} 
            onToChange={setToDate} 
          />
        </FilterBar>

        <RelationshipManagerTable
          data={displayData}
          isLoading={isLoading || isFetching}
          page={page}
          limit={limit}
          total={totalFiltered}
          onPageChange={handlePageChange}
          onLimitChange={setLimit}
          onEdit={(user) => {
             console.log('Edit user:', user);
          }}
          onDelete={(id) => {
            setSelectedUserId(id);
            setIsDeleteDialogOpen(true);
          }}
        />
      </div>

      <AppDrawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="New Relationship Manager"
        description="Fill in the details to create a new relationship manager account."
      >
        <RelationshipManagerForm 
          onSubmit={handleCreate} 
          isLoading={isCreating} 
        />
      </AppDrawer>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete User"
        description="Are you sure you want to delete this relationship manager? This action cannot be undone."
      />
    </div>
  );
};
