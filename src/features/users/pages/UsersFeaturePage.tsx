import React, { useState } from 'react';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { FilterBar, SearchInput, DateRangeFilter } from '../../../shared/components/FilterBar/FilterBar';
import { AppDrawer } from '../../../shared/components/AppDrawer/AppDrawer';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog/ConfirmDialog';
import { Button } from '../../../components/ui/button';
import { Plus } from 'lucide-react';
import { UserTable } from '../components/UserTable';
import { UserForm } from '../components/UserForm';
import { 
  useGetAllUsersByRoleIdQuery, 
  useCreateUserMutation, 
  useUpdateUserMutation,
  useDeleteUserMutation 
} from '../api/usersApi';
import { usePermissions } from '../../../hooks/usePermissions';
import { toast } from 'sonner';
import type { User } from '../types';

interface UsersFeaturePageProps {
  roleId: number;
  roleLabel: string;
  title: string;
  description: string;
  permissionPrefix: 'manager' | 'agent';
}

export const UsersFeaturePage = ({
  roleId,
  roleLabel,
  title,
  description,
  permissionPrefix
}: UsersFeaturePageProps) => {
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
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Queries & Mutations
  const { data: serverUsers = [], isLoading, isFetching } = useGetAllUsersByRoleIdQuery({
    role_id: roleId,
    offset: serverOffset,
  });

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

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

  const handlePageChange = (newPage: number) => {
    const targetIndex = (newPage - 1) * limit;
    const newServerOffset = Math.floor(targetIndex / 200) * 200;
    if (newServerOffset !== serverOffset) {
      setServerOffset(newServerOffset);
    }
    setPage(newPage);
  };

  // Handlers
  const handleAddClick = () => {
    setEditingUser(null);
    setIsDrawerOpen(true);
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setIsDrawerOpen(true);
  };

  const handleFormSubmit = async (values: any) => {
    try {
      if (editingUser) {
        await updateUser({ ...values, id: editingUser.id }).unwrap();
        toast.success('Updated successfully');
      } else {
        await createUser({ ...values, role_id: roleId }).unwrap();
        toast.success('Created successfully');
      }
      setIsDrawerOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    if (!selectedUserId) return;
    try {
      await deleteUser(selectedUserId).unwrap();
      toast.success('Deleted successfully');
      setIsDeleteDialogOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Delete operation failed');
    }
  };

  const actions = can(`${permissionPrefix}.create`) && (
    <Button onClick={handleAddClick}>
      <Plus className="h-4 w-4 mr-2" />
      Add {roleLabel}
    </Button>
  );

  return (
    <div className="space-y-4">
      <PageHeader 
        title={title} 
        description={description}
        actions={actions}
      />

      <div className="border rounded-lg p-4 bg-white dark:bg-zinc-950 shadow-sm space-y-4">
        <FilterBar onReset={() => { setSearch(''); setFromDate(''); setToDate(''); }}>
          <SearchInput value={search} onChange={setSearch} placeholder={`Search ${roleLabel.toLowerCase()}s...`} />
          <DateRangeFilter 
            fromDate={fromDate} 
            toDate={toDate} 
            onFromChange={setFromDate} 
            onToChange={setToDate} 
          />
        </FilterBar>

        <UserTable
          data={displayData}
          isLoading={isLoading || isFetching}
          page={page}
          limit={limit}
          total={totalFiltered}
          onPageChange={handlePageChange}
          onLimitChange={setLimit}
          onEdit={handleEditClick}
          onDelete={(id) => {
            setSelectedUserId(id);
            setIsDeleteDialogOpen(true);
          }}
          permissionPrefix={permissionPrefix}
        />
      </div>

      <AppDrawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingUser ? `Edit ${roleLabel}` : `New ${roleLabel}`}
        description={editingUser ? "Modify user details below." : `Fill in the details to create a new ${roleLabel.toLowerCase()} account.`}
      >
        <UserForm 
          onSubmit={handleFormSubmit} 
          isLoading={isCreating || isUpdating} 
          initialValues={editingUser || undefined}
          isEdit={!!editingUser}
          roleId={roleId}
          roleLabel={roleLabel}
        />
      </AppDrawer>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete User"
        description={`Are you sure you want to delete this ${roleLabel.toLowerCase()}? This action cannot be undone.`}
      />
    </div>
  );
};
