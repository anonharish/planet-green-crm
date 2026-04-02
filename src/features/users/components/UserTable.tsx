import React from 'react';
import { usePermissions } from '../../../hooks/usePermissions';
import {
  Pencil, Trash2, MoreVertical, Eye, Users,
  ChevronLeft, ChevronRight, ArrowUp, ArrowDown, ArrowUpDown
} from 'lucide-react';
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
import type { User } from '../types';
import type { Permission } from '../../../config/permissions';

import { CustomerLeadsDialog } from '../../customers/components/CustomerLeadsDialog';
import { ExperienceManagerListDialog } from './ExperienceManagerListDialog';

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

/* ─────────────────────────────────────────────
   AVATAR — pastel bg + matching dark initial
───────────────────────────────────────────── */
const PALETTE = [
  { bg: 'bg-sky-100',     text: 'text-sky-700'     },
  { bg: 'bg-emerald-100', text: 'text-emerald-700'  },
  { bg: 'bg-orange-100',  text: 'text-orange-600'   },
  { bg: 'bg-pink-100',    text: 'text-pink-600'     },
  { bg: 'bg-violet-100',  text: 'text-violet-700'   },
  { bg: 'bg-teal-100',    text: 'text-teal-700'     },
  { bg: 'bg-red-100',     text: 'text-red-500'      },
  { bg: 'bg-amber-100',   text: 'text-amber-700'    },
  { bg: 'bg-indigo-100',  text: 'text-indigo-700'   },
  { bg: 'bg-lime-100',    text: 'text-lime-700'     },
];

const getColor    = (i: number) => PALETTE[i % PALETTE.length];
const getInitials = (f: string, l: string) =>
  `${f?.[0] ?? ''}${l?.[0] ?? ''}`.toUpperCase();

/* ─────────────────────────────────────────────
   SUB-COMPONENT: Avatar
───────────────────────────────────────────── */
const Avatar = ({ initials, index }: { initials: string; index: number }) => {
  const { bg, text } = getColor(index);
  return (
    <div
      className={`
        w-10 h-10 rounded-full shrink-0 select-none
        flex items-center justify-center
        font-bold text-[13px] tracking-wide
        ${bg} ${text}
      `}
    >
      {initials}
    </div>
  );
};

/* ─────────────────────────────────────────────
   SUB-COMPONENT: HeaderRow
───────────────────────────────────────────── */
type SortField = 'created_on' | 'first_name';

interface HeaderRowProps {
  sortField?: SortField;
  sortOrder?: 'asc' | 'desc';
  onSort?: (f: SortField) => void;
}

const HeaderRow = ({ sortField, sortOrder, onSort }: HeaderRowProps) => {
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 opacity-30 ml-1" />;
    return sortOrder === 'asc'
      ? <ArrowUp   className="h-3 w-3 ml-1 text-[#1a3c6e]" />
      : <ArrowDown className="h-3 w-3 ml-1 text-[#1a3c6e]" />;
  };

  const cell = 'text-[11px] font-semibold uppercase tracking-widest text-zinc-500';

  return (
    <div className="grid grid-cols-[2.2fr_1.8fr_130px_110px_90px_48px] gap-4 items-center px-6 py-4 bg-[#EEF1F5] rounded-xl mb-3">
      <button
        onClick={() => onSort?.('first_name')}
        className={`${cell} flex items-center hover:text-zinc-600 transition-colors w-fit`}
      >
        Name <SortIcon field="first_name" />
      </button>
      <span className={cell}>Contact Info</span>
      <button
        onClick={() => onSort?.('created_on')}
        className={`${cell} flex items-center hover:text-zinc-600 transition-colors w-fit`}
      >
        Creation Date <SortIcon field="created_on" />
      </button>
      <span className={`${cell} text-center`}>Active Leads</span>
      <span className={`${cell} text-center`}>EM Count</span>
      <span className={`${cell} text-right`}>Actions</span>
    </div>
  );
};

/* ─────────────────────────────────────────────
   SUB-COMPONENT: TableRowCard
───────────────────────────────────────────── */
interface TableRowCardProps {
  user: User;
  index: number;
  permissionPrefix: 'manager' | 'agent';
  can: (p: Permission) => boolean;
  onEdit: (u: User) => void;
  onDelete: (id: number) => void;
  onViewLeads: (u: User) => void;
  onViewEMs: (u: User) => void;
}

const TableRowCard = ({
  user,
  index,
  permissionPrefix,
  can,
  onEdit,
  onDelete,
  onViewLeads,
  onViewEMs,
}: TableRowCardProps) => {
  const initials = getInitials(user.first_name, user.last_name);

  return (
    <div
      className="
        grid grid-cols-[2.2fr_1.8fr_130px_110px_90px_48px] gap-4 items-center
        px-6 py-5
        bg-white rounded-xl
        border border-zinc-100
        shadow-sm
        hover:shadow-md hover:border-zinc-200
        transition-all duration-150
      "
    >
      {/* ── Name + Avatar ── */}
      <div className="flex items-center gap-3 min-w-0">
        <Avatar initials={initials} index={index} />
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-zinc-800 truncate leading-snug">
            {user.first_name} {user.last_name}
          </p>
          <p className="text-[11px] text-zinc-400 mt-0.5 truncate">
            {user.login_id ?? '—'}
          </p>
        </div>
      </div>

      {/* ── Contact Info ── */}
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-zinc-700 truncate">
          {user.phone_number || '—'}
        </p>
        <p className="text-[11px] text-zinc-400 truncate mt-0.5">
          {user.email || '—'}
        </p>
      </div>

      {/* ── Creation Date ── */}
      <p className="text-[13px] text-zinc-500">
        {formatDate(user.created_on)}
      </p>

      {/* ── Active Leads ── */}
      <div className="flex justify-center">
        <span className="text-[22px] font-bold text-[#1a3c6e] leading-none tracking-tight">
          {user.active_leads ?? 0}
        </span>
      </div>

      {/* ── EM Count ── */}
      <div className="flex justify-center">
        <button
          onClick={() => onViewEMs(user)}
          className="text-[22px] font-bold text-blue-500 leading-none tracking-tight hover:text-blue-700 transition-colors"
        >
          {user.em_count ?? 0}
        </button>
      </div>

      {/* ── Actions: 3-dot kebab ── */}
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors">
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52 text-xs">
            <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 px-3 py-2">
              User Actions
            </DropdownMenuLabel>

            <DropdownMenuItem
              onClick={() => onViewLeads(user)}
              className="cursor-pointer gap-2 py-2"
            >
              <Eye className="h-4 w-4 text-emerald-500" />
              View Leads
            </DropdownMenuItem>

            {can(`${permissionPrefix}.edit` as Permission) && (
              <DropdownMenuItem
                onClick={() => onEdit(user)}
                className="cursor-pointer gap-2 py-2"
              >
                <Pencil className="h-4 w-4 text-blue-500" />
                Edit Details
              </DropdownMenuItem>
            )}

            <DropdownMenuItem
              onClick={() => onViewEMs(user)}
              className="cursor-pointer gap-2 py-2"
            >
              <Users className="h-4 w-4 text-violet-500" />
              View Experience Managers
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {can(`${permissionPrefix}.delete` as Permission) && (
              <DropdownMenuItem
                onClick={() => onDelete(user.id)}
                className="cursor-pointer gap-2 py-2 text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete User
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   SKELETON
───────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="grid grid-cols-[2.2fr_1.8fr_130px_110px_90px_48px] gap-4 items-center px-5 py-4 bg-white rounded-xl border border-zinc-100 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-zinc-100 shrink-0" />
      <div className="space-y-1.5 flex-1">
        <div className="h-3.5 bg-zinc-100 rounded w-32" />
        <div className="h-2.5 bg-zinc-100 rounded w-20" />
      </div>
    </div>
    <div className="space-y-1.5">
      <div className="h-3 bg-zinc-100 rounded w-28" />
      <div className="h-2.5 bg-zinc-100 rounded w-36" />
    </div>
    <div className="h-3 bg-zinc-100 rounded w-20" />
    <div className="h-6 bg-zinc-100 rounded w-10 mx-auto" />
    <div className="h-6 bg-zinc-100 rounded w-8 mx-auto" />
    <div className="h-8 w-8 bg-zinc-100 rounded-full ml-auto" />
  </div>
);

/* ─────────────────────────────────────────────
   MAIN EXPORT: UserTable
───────────────────────────────────────────── */
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
  offset = 0,
}: UserTableProps) => {
  const { can } = usePermissions();

  const [openLeads,         setOpenLeads]         = React.useState(false);
  const [selectedRM,        setSelectedRM]        = React.useState<User | null>(null);
  const [openEMDialog,      setOpenEMDialog]      = React.useState(false);
  const [selectedEMManager, setSelectedEMManager] = React.useState<User | null>(null);

  const totalPages    = Math.ceil(total / limit);
  const globalStart   = (page - 1) * limit;
  const from          = total === 0 ? 0 : globalStart + 1;
  const to            = Math.min(globalStart + limit, total);
  const relativeStart = Math.max(0, globalStart - offset);
  const slicedData    = data.slice(relativeStart, relativeStart + limit);

  /* smart page number array */
  const pageNumbers = React.useMemo(() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 3)       return [1, 2, 3, '…', totalPages];
    if (page >= totalPages - 2) return [1, '…', totalPages - 2, totalPages - 1, totalPages];
    return [1, '…', page - 1, page, page + 1, '…', totalPages];
  }, [page, totalPages]);

  return (
    <>
      {/* ── Outer panel ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-0">

       
        {/* Data cards */}
        <div className="flex flex-col gap-3">
          {isLoading ? (
            Array.from({ length: limit }).map((_, i) => <SkeletonCard key={i} />)
          ) : slicedData.length === 0 ? (
            <div className="text-center py-20 text-zinc-400 text-sm bg-white rounded-xl border border-zinc-100">
              No records found.
            </div>
          ) : (
            slicedData.map((user, index) => (
              <TableRowCard
                key={user.id}
                user={user}
                index={relativeStart + index}
                permissionPrefix={permissionPrefix}
                can={can}
                onEdit={onEdit}
                onDelete={onDelete}
                onViewLeads={(u) => { setSelectedRM(u); setOpenLeads(true); }}
                onViewEMs={(u)   => { setSelectedEMManager(u); setOpenEMDialog(true); }}
              />
            ))
          )}
        </div>

        {/* ── Pagination ─────────────────────────────────────────── */}
        {/* ✅ WHITE FOOTER (LIKE HEADER) */}
{/* ✅ WHITE FOOTER */}
<div className="bg-white px-6 py-4 border-t border-zinc-200 flex items-center justify-between -mx-6 mt-4">
  <span className="text-xs text-zinc-400">
    Showing <strong className="text-zinc-600">
      {(page - 1) * limit + 1}–{Math.min(page * limit, total)}
    </strong> of{' '}
    <strong className="text-zinc-600">{total}</strong> Records
  </span>

  <div className="flex items-center gap-2">
    <button
      className="px-3 py-1.5 border rounded-md text-sm"
      disabled={page === 1}
      onClick={() => onPageChange(page - 1)}
    >
      Previous
    </button>

    <span className="px-3 py-1.5 bg-[#1a3c6e] text-white rounded-md text-sm">
      {page}
    </span>

    <button
      className="px-3 py-1.5 border rounded-md text-sm"
      disabled={page * limit >= total}
      onClick={() => onPageChange(page + 1)}
    >
      Next
    </button>
  </div>
</div>

      </div>

      {/* ── Dialogs ─────────────────────────────────────────────── */}
      <CustomerLeadsDialog
        open={openLeads}
        onClose={() => { setOpenLeads(false); setSelectedRM(null); }}
        customerUuid={null}
        rmId={selectedRM?.id}
        customerName={selectedRM ? `${selectedRM.first_name} ${selectedRM.last_name}` : undefined}
      />

      <ExperienceManagerListDialog
        open={openEMDialog}
        onClose={() => { setOpenEMDialog(false); setSelectedEMManager(null); }}
        manager={selectedEMManager}
      />
    </>
  );
};