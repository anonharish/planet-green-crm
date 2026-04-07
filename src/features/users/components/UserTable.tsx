import React from 'react';
import { DataTable } from '../../../shared/components/DataTable/DataTable';
import { usePermissions } from '../../../hooks/usePermissions';
import { useMasterDataLookup } from '../../../shared/hooks/useMasterDataLookup';
import { Pencil, Users, Phone, LayoutList } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { formatDate } from '../../../utils';
import { ExperienceManagerListDialog } from './ExperienceManagerListDialog';
import { UserLeadsDialog } from './UserLeadsDialog';
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

const AVATAR_PALETTE = [
  { bg: '#FEF3C7', text: '#92400E' },
  { bg: '#DBEAFE', text: '#1D4ED8' },
  { bg: '#D1FAE5', text: '#065F46' },
  { bg: '#FCE7F3', text: '#9D174D' },
  { bg: '#EDE9FE', text: '#5B21B6' },
  { bg: '#CFFAFE', text: '#155E75' },
  { bg: '#FEE2E2', text: '#991B1B' },
];

function avatarStyle(id: number) {
  return AVATAR_PALETTE[id % AVATAR_PALETTE.length];
}

const TRAY = '#F3F4F6';
const WHITE = '#ffffff';

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
  const { getRmLabel, isLoading: isLookupLoading } = useMasterDataLookup();
  const [viewAgentsManager, setViewAgentsManager] = React.useState<User | null>(null);
  const [selectedLeadsUser, setSelectedLeadsUser] = React.useState<User | null>(null);

  const columns: ColumnDef<User>[] = [
    {
      key: 'first_name',
      header: permissionPrefix === 'manager' ? 'RM Name' : 'EM Name',
      sortable: true,
      render: (user) => {
        const initials = `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase();
        const s = avatarStyle(user.id);
        return (
          <div className="flex items-center gap-3">
            <div style={{
              width: 42, height: 42, borderRadius: '50%',
              background: s.bg, color: s.text,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 13, flexShrink: 0,
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            }}>
              {initials || '??'}
            </div>
            <span className="font-semibold text-gray-900 text-sm">
              {user.first_name} {user.last_name}
            </span>
          </div>
        );
      },
    },
    {
      key: 'phone_number',
      header: 'Contact Info',
      render: (user) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <Phone size={12} className="text-zinc-400 shrink-0" />
            <span className="font-medium text-gray-800 text-sm">{user.phone_number}</span>
          </div>
          <span className="text-zinc-400 text-xs pl-[18px]">{user.email}</span>
        </div>
      ),
    },
    {
      key: 'created_on',
      header: 'Creation Date',
      sortable: true,
      render: (user) => (
        <span className="text-sm text-gray-600 font-medium">{formatDate(user.created_on)}</span>
      ),
    },
    ...(permissionPrefix === 'manager' ? [{
      key: 'em_count' as keyof User,
      header: 'EM Count',
      render: (user: User) => (
        <span
          className="text-blue-600 cursor-pointer underline underline-offset-2 font-semibold px-2"
          onClick={() => { if (user.role_id === 3) setViewAgentsManager(user); }}
        >
          {user.reportee_count ?? 0}
        </span>
      ),
    }] : []),
    ...(permissionPrefix === 'agent' ? [{
      key: 'reporting_manager_id' as keyof User,
      header: 'Assigned RM',
      render: (user: User) => (
        <span className="text-zinc-500 font-medium text-sm">{getRmLabel(user.reporting_manager_id)}</span>
      ),
    }] : []),
    {
      key: 'actions',
      header: 'Actions',
      width: '120px',
      render: (user: User) => (
        <div className="flex items-center gap-1">
          {can(`${permissionPrefix}.edit` as Permission) && (
            <Button variant="ghost" size="icon"
              className="h-8 w-8 rounded-lg hover:bg-blue-50 transition"
              onClick={() => onEdit(user)} title="Edit">
              <Pencil className="h-4 w-4 text-blue-500" />
            </Button>
          )}
          <Button variant="ghost" size="icon"
            className="h-8 w-8 rounded-lg hover:bg-[#0f3d6b]/10 transition"
            onClick={() => setSelectedLeadsUser(user)} title="View Leads">
            <LayoutList className="h-4 w-4 text-[#0f3d6b]" />
          </Button>
          {user.role_id === 3 && (
            <Button variant="ghost" size="icon"
              className="h-8 w-8 rounded-lg hover:bg-emerald-50 transition"
              onClick={() => setViewAgentsManager(user)} title="View Experience Managers">
              <Users className="h-4 w-4 text-emerald-500" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <style>{`

        /* ══════════════════════════════════════════════════════
           HEADER  — white background, bottom divider
        ══════════════════════════════════════════════════════ */
        .rm-section-header {
          background: ${WHITE};
          padding: 16px 24px 14px;
          border-bottom: 1px solid #f0f4f8;
        }
        .rm-section-header p {
          font-size: 15px; font-weight: 700; color: #1a2e44; margin: 0;
        }

        /* ══════════════════════════════════════════════════════
           GRAY TRAY  — #F3F4F6 everywhere inside .rm-table
        ══════════════════════════════════════════════════════ */
        .rm-table,
        .rm-table > *,
        .rm-table > * > *,
        .rm-table table,
        .rm-table thead,
        .rm-table thead tr,
        .rm-table thead th {
          background: ${TRAY} !important;
        }

        .rm-table {
          padding: 12px 16px 0;
        }

        /* Column header text style */
        .rm-table thead th {
          border: none !important;
          box-shadow: none !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          color: #8fa3b8 !important;
          letter-spacing: 0.07em !important;
          text-transform: uppercase !important;
          padding-top: 4px !important;
          padding-bottom: 8px !important;
        }
.rm-table thead th button {
  background: #f1f5f9 !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 10px !important;
  padding: 6px 12px !important;
  font-size: 12px !important;
  color: #64748b !important;
  height: 36px;
  display: flex;
  align-items: center;
}

/* Hover */
.rm-table thead th button:hover {
  background: #e9eef5 !important;
}

        /* Card gaps via border-spacing */
        .rm-table table {
          border-collapse: separate !important;
          border-spacing: 0 10px !important;
          width: 100%;
        }

        /* ══════════════════════════════════════════════════════
           CARD ROWS  — white floating cards
        ══════════════════════════════════════════════════════ */
        .rm-table tbody tr {
          background: ${WHITE} !important;
          box-shadow: 0 1px 6px rgba(15,61,107,0.09) !important;
          border-radius: 12px !important;
          transition: box-shadow 0.15s, transform 0.12s;
        }
        .rm-table tbody tr:hover {
          box-shadow: 0 4px 16px rgba(15,61,107,0.16) !important;
          transform: translateY(-1px);
          background: #f8fbff !important;
        }
        .rm-table tbody tr td:first-child { border-radius: 12px 0 0 12px !important; }
        .rm-table tbody tr td:last-child  { border-radius: 0 12px 12px 0 !important; }
        .rm-table tbody tr td {
          border: none !important;
          background: inherit !important;
          padding-top: 18px !important;
          padding-bottom: 18px !important;
        }

        /* ══════════════════════════════════════════════════════
           FOOTER  — white background, top divider
           (same treatment as the header)
        ══════════════════════════════════════════════════════ */
 /* Footer container */
.rm-table tfoot,
.rm-table [class*="footer"],
.rm-table [class*="Footer"] {
  background: #ffffff !important;
  border-top: 1px solid #f0f4f8 !important;
  padding: 14px 20px !important;
}

/* Inner footer layout fix */
.rm-table [class*="footer"] > div {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  width: 100%;
}

/* Left text */
.rm-table [class*="footer"] span {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

/* Pagination container */
.rm-table [class*="pagination"] {
  display: flex !important;
  align-items: center;
  gap: 8px;
}

/* Buttons */
.rm-table button {
  border-radius: 10px !important;
  min-width: 36px;
  height: 36px;
  font-size: 13px;
  border: 1px solid #e5e7eb;
  background: white;
}

/* Active page */
.rm-table button[aria-current="page"] {
  background: #0f3d6b !important;
  color: #fff !important;
  border: none;
}

/* Disabled buttons */
.rm-table button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Hover */
.rm-table button:not(:disabled):hover {
  background: #f3f4f6;
}
      `}</style>

      {/* ── White header ── */}
      <div className="rm-section-header">
        <p>
          Active{" "}
          {permissionPrefix === "manager" ? "Relationship" : "Experience"}{" "}
          Managers
        </p>
      </div>

      {/* ── Gray tray ── */}
      <div className="rm-table">
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
      </div>

      <ExperienceManagerListDialog
        open={!!viewAgentsManager}
        onClose={() => setViewAgentsManager(null)}
        manager={viewAgentsManager}
      />
      <UserLeadsDialog
        open={!!selectedLeadsUser}
        onClose={() => setSelectedLeadsUser(null)}
        user={selectedLeadsUser}
      />
    </>
  );
};