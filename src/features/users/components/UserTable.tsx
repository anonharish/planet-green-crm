import React from 'react';
import { DataTable } from '../../../shared/components/DataTable/DataTable';
import { usePermissions } from '../../../hooks/usePermissions';
import { useMasterDataLookup } from '../../../shared/hooks/useMasterDataLookup';
import { Pencil, Trash2, MoreVertical, Users, Phone } from 'lucide-react';
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
import { UserLeadsDialog } from './UserLeadsDialog';
import { LayoutList } from 'lucide-react';
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
  const { getRmLabel, isLoading: isLookupLoading } = useMasterDataLookup();
  const [viewAgentsManager, setViewAgentsManager] = React.useState<User | null>(null);
  const [selectedLeadsUser, setSelectedLeadsUser] = React.useState<User | null>(null);

  const columns: ColumnDef<User>[] = [
    {
      key: 'first_name',
      header: permissionPrefix === 'manager' ? 'RM Name' : 'EM Name',
      sortable: true,
      render: (user) => {
        const initials = `${user.first_name[0] || ''}${user.last_name[0] || ''}`.toUpperCase();
        return (
          <div className="flex items-center gap-3 py-1">
            <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400 shrink-0 border border-blue-100 dark:border-blue-800">
              {initials || '??'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-black text-zinc-900 dark:text-zinc-100 truncate">
                {user.first_name} {user.last_name}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'phone_number',
      header: 'Contact Info',
      render: (user) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <Phone size={12} className="text-zinc-400" />
            <span className="font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
              {user.phone_number}
            </span>
          </div>
          <span className="text-zinc-400 font-medium text-xs">
            {user.email}
          </span>
        </div>
      ),
    },
    {
      key: 'created_on',
      header: 'Creation Date',
      sortable: true,
      render: (user) => <span>{formatDate(user.created_on)}</span>,
    },
    ...(permissionPrefix === 'manager' ? [{
      key: 'em_count',
      header: 'EM Count',
      render: (user: User) => (
        <span
          className="cursor-pointer text-[#0f3d6b] font-black hover:underline px-4"
          onClick={() => {
            if (user.role_id === 3) {
              setViewAgentsManager(user);
            }
          }}
        >
          {user.reportee_count ?? 0}
        </span>
      ),
    }] : []),
    ...(permissionPrefix === 'agent' ? [{
      key: 'reporting_manager_id',
      header: 'Assigned RM',
      render: (user: User) => <span className="text-zinc-500 font-medium">{getRmLabel(user.reporting_manager_id)}</span>,
    }] : []),
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

              <DropdownMenuItem onClick={() => setSelectedLeadsUser(user)} className="cursor-pointer gap-2 py-2">
                <LayoutList className="h-4 w-4 text-[#0f3d6b]" />
                <span>View Assigned Leads</span>
              </DropdownMenuItem>

              {user.role_id === 3 && (
                <DropdownMenuItem onClick={() => setViewAgentsManager(user)} className="cursor-pointer gap-2 py-2">
                  <Users className="h-4 w-4 text-emerald-500" />
                  <span>View Experience Managers</span>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />
              
              {/* {can(`${permissionPrefix}.delete` as Permission) && (
                <DropdownMenuItem 
                  onClick={() => onDelete(user.id)} 
                  className="cursor-pointer gap-2 py-2 text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/10"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete User</span>
                </DropdownMenuItem>
              )} */}
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
        isLoading={isLoading || isLookupLoading}
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

      <UserLeadsDialog
        open={!!selectedLeadsUser}
        onClose={() => setSelectedLeadsUser(null)}
        userId={selectedLeadsUser?.id || null}
        userName={selectedLeadsUser ? `${selectedLeadsUser.first_name} ${selectedLeadsUser.last_name}` : ''}
        type={permissionPrefix === 'manager' ? 'RM' : 'EM'}
      />
    </>
  );
};
