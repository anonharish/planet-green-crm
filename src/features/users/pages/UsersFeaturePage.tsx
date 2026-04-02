import React, { useState } from 'react';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { FilterBar, SearchInput } from '../../../shared/components/FilterBar/FilterBar';
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
  searchPlaceholder?: string;
}

export const UsersFeaturePage = ({
  roleId,
  roleLabel,
  title,
  description,
  permissionPrefix,
  searchPlaceholder
}: UsersFeaturePageProps) => {
  const { can } = usePermissions();
  
  // 1. Server-side Offset State
  const [serverOffset, setServerOffset] = useState(0);
  
  // 2. Client-side Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  // 3. Filter/Search/Sort State
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'created_on' | 'first_name'>('created_on');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // Default sorting: date desc

  // Drawer/Dialog States
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

  // 4. Client-side Filtering & Sorting Logic
  const sortedAndFilteredData = React.useMemo(() => {
    let result = [...serverUsers];
    
    // Search Filter
    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter((u: User) => 
        u.first_name.toLowerCase().includes(lowerSearch) || 
        u.last_name.toLowerCase().includes(lowerSearch) ||
        u.login_id.toLowerCase().includes(lowerSearch) ||
        u.email.toLowerCase().includes(lowerSearch) ||
        (u.phone_number && u.phone_number.includes(search))
      );
    }

    // Sort Logic
    result.sort((a, b) => {
      let valA: any;
      let valB: any;

      if (sortField === 'created_on') {
        valA = a.created_on ? new Date(a.created_on).getTime() : 0;
        valB = b.created_on ? new Date(b.created_on).getTime() : 0;
      } else {
        valA = a.first_name.toLowerCase();
        valB = b.first_name.toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [serverUsers, search, sortField, sortOrder]);

  const totalItems = sortedAndFilteredData.length < 200 ? serverOffset + sortedAndFilteredData.length : serverOffset + 201;

  // Handlers
  const handlePageChange = (newPage: number) => {
    const targetIndex = (newPage - 1) * limit;
    const newServerOffset = Math.floor(targetIndex / 200) * 200;
    if (newServerOffset !== serverOffset) {
      setServerOffset(newServerOffset);
    }
    setPage(newPage);
  };

  const handleSort = (field: 'created_on' | 'first_name') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

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

  const handleDeleteConfirm = async () => {
    if (!selectedUserId) return;
    try {
      await deleteUser(selectedUserId).unwrap();
      toast.success('Deleted successfully');
      setIsDeleteDialogOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Delete operation failed');
    }
  };

  // Actions Header
  const actions = can(`${permissionPrefix}.create`) && (
    <Button onClick={handleAddClick}>
      Create
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
        <FilterBar>
          <SearchInput 
            value={search} 
            onChange={setSearch} 
            placeholder={searchPlaceholder || `Search ${roleLabel.toLowerCase()}s...`} 
          />
        </FilterBar>

        <UserTable
          data={sortedAndFilteredData}
          isLoading={isLoading || isFetching}
          page={page}
          limit={limit}
          total={totalItems}
          onPageChange={handlePageChange}
          onLimitChange={setLimit}
          onEdit={handleEditClick}
          onDelete={(id) => {
            setSelectedUserId(id);
            setIsDeleteDialogOpen(true);
          }}
          permissionPrefix={permissionPrefix}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
          offset={serverOffset}
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
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title="Delete User"
        description={`Are you sure you want to delete this ${roleLabel.toLowerCase()}? This action cannot be undone.`}
      />
    </div>
  );
};
