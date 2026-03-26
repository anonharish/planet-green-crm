import React from 'react';
import { DataTable } from '../../../shared/components/DataTable/DataTable';
import { usePermissions } from '../../../hooks/usePermissions';
import { Pencil, Trash2, MoreVertical, Users } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '../../../components/ui/dropdown-menu';
import { formatDate } from '../../../utils';
import { ExperienceManagerListDialog } from './ExperienceManagerListDialog';
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
  sortField?: 'created_on' | 'first_name';
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: 'created_on' | 'first_name') => void;
  offset?: number;
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
  permissionPrefix,
  sortField,
  sortOrder,
  onSort,
  offset = 0
}: UserTableProps) => {
  const { can } = usePermissions();
  const [viewAgentsManager, setViewAgentsManager] = React.useState<User | null>(null);

  const columns: ColumnDef<User>[] = [
    {
      key: 'first_name',
      header: 'First Name',
      sortable: true,
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
      key: 'created_on',
      header: 'Creation Date',
      sortable: true,
      render: (user) => <span>{formatDate(user.created_on)}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '60px',
      render: (user: User) => (
        <div className="flex items-center justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 text-xs">
              <DropdownMenuLabel className="font-normal text-zinc-500 uppercase tracking-wider px-3 py-2">
                User Actions
              </DropdownMenuLabel>
              
              {can(`${permissionPrefix}.edit` as Permission) && (
                <DropdownMenuItem onClick={() => onEdit(user)} className="cursor-pointer gap-2 py-2">
                  <Pencil className="h-4 w-4 text-blue-500" />
                  <span>Edit Details</span>
                </DropdownMenuItem>
              )}

              {user.role_id === 3 && (
                <DropdownMenuItem onClick={() => setViewAgentsManager(user)} className="cursor-pointer gap-2 py-2">
                  <Users className="h-4 w-4 text-emerald-500" />
                  <span>View Experience Managers</span>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />
              
              {can(`${permissionPrefix}.delete` as Permission) && (
                <DropdownMenuItem 
                  onClick={() => onDelete(user.id)} 
                  className="cursor-pointer gap-2 py-2 text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/10"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete User</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <>
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
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={onSort as any}
        offset={offset}
      />
      
      <ExperienceManagerListDialog 
        open={!!viewAgentsManager}
        onClose={() => setViewAgentsManager(null)}
        manager={viewAgentsManager}
      />
    </>
  );
};
