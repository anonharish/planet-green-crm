import React from 'react';
import { DataTable } from '../../../shared/components/DataTable/DataTable';
import { usePermissions } from '../../../hooks/usePermissions';
import { useMasterDataLookup } from '../../../shared/hooks/useMasterDataLookup';
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
import { ExperienceManagerListDialog } from './ExperienceManagerListDialog';
import { UserLeadsDialog } from './UserLeadsDialog';
import { cn } from '../../../utils';
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
  const { isLoading: isLookupLoading } = useMasterDataLookup();
  const [viewAgentsManager, setViewAgentsManager] = React.useState<User | null>(null);
  const [viewLeadsUser, setViewLeadsUser] = React.useState<User | null>(null);

  const getAvatarStyles = (id: number) => {
    const styles = [
      { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' },
      { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400' },
      { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400' },
      { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400' },
    ];
    return styles[id % styles.length];
  };

  const formatRegistryDate = (dateString?: string) => {
    if (!dateString) return '---';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '---';
    
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    }).format(date).toUpperCase();
  };

  const columns: ColumnDef<User>[] = [
    {
      key: 'first_name',
      header: 'Manager Name',
      sortable: true,
      width: '280px',
      render: (user) => {
        const { bg, text } = getAvatarStyles(user.id);
        const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase();
        
        return (
          <div className="flex items-center gap-4 py-2">
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-sm border border-zinc-100 dark:border-zinc-800", bg, text)}>
              {initials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm truncate leading-tight">
                {user.first_name} {user.last_name}
              </span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider mt-0.5 truncate">
                {user.role_description || 'Experience Manager'}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'phone_number',
      header: 'Phone Number',
      width: '180px',
      render: (user) => (
        <span className="text-zinc-900 dark:text-zinc-100 font-bold text-sm tracking-tight whitespace-nowrap">
          {user.phone_number.startsWith('+') ? user.phone_number : `+91 ${user.phone_number}`}
        </span>
      ),
    },
    {
      key: 'email',
      header: 'Email Address',
      render: (user) => (
        <span className="text-zinc-500 dark:text-zinc-400 font-medium text-sm truncate max-w-[200px] block">
          {user.email}
        </span>
      ),
    },
    {
      key: 'created_on',
      header: 'Creation Date',
      sortable: true,
      width: '150px',
      render: (user) => (
        <span className="text-zinc-400 dark:text-zinc-500 font-bold text-[11px] tracking-wider uppercase">
          {formatRegistryDate(user.created_on)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '140px',
      render: (user: User) => (
        <div className="flex items-center justify-end gap-2">
          {(user.role_id === 2 || user.role_id === 4) ? (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-[11px] font-bold uppercase rounded-xl border-zinc-200 dark:border-zinc-800 text-[#0f3d6b] dark:text-blue-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all px-4 shadow-none shrink-0"
              onClick={() => setViewLeadsUser(user)}
            >
              View Leads
            </Button>
          ) : (
             <div className="flex items-center justify-center w-full">
              <span className="text-zinc-300 dark:text-zinc-700">---</span>
             </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 opacity-40 hover:opacity-100 transition-all shrink-0"
              >
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
        open={!!viewLeadsUser}
        onClose={() => setViewLeadsUser(null)}
        user={viewLeadsUser}
      />
    </>
  );
};