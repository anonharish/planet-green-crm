import React from 'react';
import { DataTable } from '../../../shared/components/DataTable/DataTable';
import { usePermissions } from '../../../hooks/usePermissions';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import type { User } from '../types';
import type { ColumnDef } from '../../../shared/components/DataTable/DataTable';
import type { Permission } from '../../../config/permissions';

interface UserTableProps {
  data: User[];
  isLoading: boolean;
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
  permissionPrefix: 'manager' | 'agent';
}

export const UserTable = ({
  data,
  isLoading,
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
  onEdit,
  onDelete,
  permissionPrefix
}: UserTableProps) => {
  const { can } = usePermissions();

  const formatDate = (dateString?: string) => {
    if (!dateString) return '---';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '---';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const columns: ColumnDef<User>[] = [
    {
      key: 'first_name',
      header: 'First Name',
      render: (user) => <span className="font-medium">{user.first_name}</span>,
    },
    {
      key: 'last_name',
      header: 'Last Name',
      render: (user) => <span>{user.last_name}</span>,
    },
    {
      key: 'phone_number',
      header: 'Phone',
      render: (user) => <span>{user.phone_number}</span>,
    },
    {
      key: 'email',
      header: 'Email',
      render: (user) => <span className="text-zinc-500">{user.email}</span>,
    },
    {
      key: 'createdAt',
      header: 'Creation Date',
      render: (user) => <span>{formatDate(user.created_on)}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '80px',
      render: (user) => (
        <div className="flex items-center gap-2">
          {can(`${permissionPrefix}.edit` as Permission) && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              onClick={() => onEdit(user)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {can(`${permissionPrefix}.delete` as Permission) && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => onDelete(user.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns as any}
      data={data}
      isLoading={isLoading}
      page={page}
      limit={limit}
      total={total}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
      rowKey={(u) => u.id}
    />
  );
};
