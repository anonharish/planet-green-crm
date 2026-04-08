import React, { useState } from 'react';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { FilterBar, SearchInput } from '../../../shared/components/FilterBar/FilterBar';
import { AppDrawer } from '../../../shared/components/AppDrawer/AppDrawer';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog/ConfirmDialog';
import { Button } from '../../../components/ui/button';
import { UserPlus } from "lucide-react";
import { UserTable } from '../components/UserTable';
import { UserForm } from '../components/UserForm';
import {
  useGetAllUsersByRoleIdQuery,
  useGetReporteesQuery,
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

  const [serverOffset, setServerOffset] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'created_on' | 'first_name'>('created_on');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { currentRole, user: currentUser } = usePermissions();
  const isRM = currentRole?.code === 'RELMNG';
  const isEMScreen = roleId === 4;

  const { data: allUsers = [], isLoading: isAllLoading, isFetching: isAllFetching } = useGetAllUsersByRoleIdQuery({
    role_id: roleId,
    offset: serverOffset,
  }, { skip: isRM && isEMScreen });

  const { data: reportees = [], isLoading: isReporteesLoading, isFetching: isReporteesFetching } = useGetReporteesQuery({
    reporting_manager_id: Number(currentUser?.id || 0),
    offset: serverOffset,
  }, { skip: !isRM || !isEMScreen });

  const serverUsers = isRM && isEMScreen ? reportees : allUsers;
  const isLoading = isRM && isEMScreen ? isReporteesLoading : isAllLoading;
  const isFetching = isRM && isEMScreen ? isReporteesFetching : isAllFetching;

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const sortedAndFilteredData = React.useMemo(() => {
    let result = [...serverUsers];
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
    result.sort((a, b) => {
      let valA: any, valB: any;
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

  const totalItems = sortedAndFilteredData.length < 200
    ? serverOffset + sortedAndFilteredData.length
    : serverOffset + 201;

  const handlePageChange = (newPage: number) => {
    const targetIndex = (newPage - 1) * limit;
    const newServerOffset = Math.floor(targetIndex / 200) * 200;
    if (newServerOffset !== serverOffset) setServerOffset(newServerOffset);
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

  const actions = can(`${permissionPrefix}.create`) && (
    <Button
      onClick={() => { setEditingUser(null); setIsDrawerOpen(true); }}
      className="bg-[#0f3d6b] hover:bg-[#0c2f54] text-white rounded-full px-5 py-2 flex items-center gap-2 shadow-sm"
    >
      <UserPlus className="h-4 w-4" />
      Create {permissionPrefix === 'manager' ? 'RM' : 'EM'}
    </Button>
  );

  return (
    <div className="space-y-4">
      <PageHeader title={title} description={description} actions={actions} />

      <FilterBar>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={`Search ${roleLabel.toLowerCase()}s...`}
        />
      </FilterBar>

      {/*
        ── Outer white card ────────────────────────────────────────────────────
        NOTE: overflow is NOT hidden here — that was clipping the gray tray
        inside UserTable. Border-radius clipping is handled by the inner
        sections themselves.
        ────────────────────────────────────────────────────────────────────── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 16,
          border: '1px solid #e8edf3',
          boxShadow: '0 1px 6px rgba(15,61,107,0.07)',
          overflow: 'hidden',   /* keep — gray tray fills naturally now */
        }}
      >
        <UserTable
          data={sortedAndFilteredData}
          isLoading={isLoading || isFetching}
          page={page}
          limit={limit}
          total={totalItems}
          onPageChange={handlePageChange}
          onLimitChange={setLimit}
          onEdit={(user) => { setEditingUser(user); setIsDrawerOpen(true); }}
          onDelete={(id) => { setSelectedUserId(id); setIsDeleteDialogOpen(true); }}
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
        showHeader={false}
        width="sm"
      >
        <UserForm
          onSubmit={handleFormSubmit}
          isLoading={isCreating || isUpdating}
          initialValues={editingUser || undefined}
          isEdit={!!editingUser}
          roleId={roleId}
          roleLabel={roleLabel}
          onClose={() => setIsDrawerOpen(false)}
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

  async function handleFormSubmit(values: any) {
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
      let message =
        err?.data?.error ||
        err?.data?.message ||
        "Something went wrong";

      if (message.includes("Duplicate entry") && message.includes("phone_number")) {
        message = "Phone number already exists";
      }

      toast.error(message);
    }
  }

  async function handleDeleteConfirm() {
    if (!selectedUserId) return;
    try {
      await deleteUser(selectedUserId).unwrap();
      toast.success('Deleted successfully');
      setIsDeleteDialogOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Delete operation failed');
    }
  }
};