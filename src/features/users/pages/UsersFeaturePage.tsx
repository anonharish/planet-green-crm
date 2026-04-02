import React, { useState } from 'react';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog/ConfirmDialog';
import { AppDrawer } from '../../../shared/components/AppDrawer/AppDrawer';
import { Button } from '../../../components/ui/button';
import { UserPlus, Search } from 'lucide-react';
import { UserTable } from '../components/UserTable';
import { UserForm } from '../components/UserForm';
import {
  useGetAllUsersByRoleIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
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
  permissionPrefix,
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

  const { data: serverUsers = [], isLoading, isFetching } = useGetAllUsersByRoleIdQuery({
    role_id: roleId,
    offset: serverOffset,
  });

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
      let valA: any;
      let valB: any;
      if (sortField === 'created_on') {
        valA = a.created_on ? new Date(a.created_on).getTime() : 0;
        valB = b.created_on ? new Date(b.created_on).getTime() : 0;
      } else {
        valA = (a.first_name + ' ' + a.last_name).toLowerCase();
        valB = (b.first_name + ' ' + b.last_name).toLowerCase();
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [serverUsers, search, sortField, sortOrder]);

  const totalItems =
    sortedAndFilteredData.length < 200
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

  return (
    <div className="space-y-5">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3c6e]">{title}</h1>
          <p className="text-sm text-zinc-500 mt-1">{description}</p>
        </div>

        {can(`${permissionPrefix}.create`) && (
          <Button
            onClick={() => { setEditingUser(null); setIsDrawerOpen(true); }}
            className="flex items-center gap-2 bg-[#1a3c6e] hover:bg-[#15305a] text-white rounded-full px-5 h-10 text-sm font-semibold shadow-sm"
          >
            <UserPlus className="h-4 w-4" />
            Create RM
          </Button>
        )}
      </div>

      {/* ── Full-width pill search bar ───────────────────────────────────── */}
      <div className="relative">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder={`Search ${roleLabel.toLowerCase()}s...`}
          className="w-full h-12 pl-12 pr-5 rounded-full border border-zinc-200 bg-white shadow-sm text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/20 focus:border-[#1a3c6e]/40 transition-all"
        />
      </div>

<div className="rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">

  {/* ✅ WHITE TOP */}
  <div className="bg-white px-6 py-4 border-b border-zinc-200">
    <h2 className="text-base font-semibold text-zinc-900">
      Active {title}
    </h2>
  </div>

  {/* ✅ GREY BODY */}
  <div className="bg-[#F8F9FB] px-6 pt-4 pb-0">

    <div className="grid grid-cols-[2.2fr_1.8fr_130px_110px_90px_48px] gap-4 items-center px-6 py-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
      <span>Name</span>
      <span>Contact Info</span>
      <span>Creation Date</span>
      <span className="text-center">Active Leads</span>
      <span className="text-center">EM Count</span>
      <span className="text-right">Actions</span>
    </div>

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
</div>

      {/* ── Drawer ──────────────────────────────────────────────────────── */}
      <AppDrawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingUser ? `Edit ${roleLabel}` : `New ${roleLabel}`}
        description={
          editingUser
            ? 'Modify user details below.'
            : `Fill in the details to create a new ${roleLabel.toLowerCase()} account.`
        }
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

      {/* ── Confirm delete ───────────────────────────────────────────────── */}
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