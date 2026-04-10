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
            <span className="font-semibold text-sm" style={{ color: '#191C1E' }}>
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
            <span className="font-medium text-sm" style={{ color: '#434653' }}>{user.phone_number}</span>
          </div>
          <span className="text-xs pl-[18px]" style={{ color: '#94A3B8' }}>{user.email}</span>
        </div>
      ),
    },
    {
      key: 'created_on',
      header: 'Creation Date',
      sortable: true,
      render: (user) => (
        <span className="text-sm font-medium" style={{ color: '#64748B' }}>{formatDate(user.created_on)}</span>
      ),
    },
    ...(permissionPrefix === 'manager' ? [{
      key: 'em_count' as keyof User,
      header: 'Assigned EM',
      render: (user: User) => (
        <span
          className="cursor-pointer underline underline-offset-2 font-semibold px-2"
          onClick={() => { if (user.role_id === 3) setViewAgentsManager(user); }}
          style={{ color: '#063669' }}
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
              className="h-8 w-8 rounded-lg hover:bg-blue-50 transition cursor-pointer"
              onClick={() => onEdit(user)} title="Edit">
              <Pencil className="h-4 w-4 text-blue-500" />
            </Button>
          )}
          <Button variant="ghost" size="icon"
            className="h-8 w-8 rounded-lg hover:bg-blue-50 transition cursor-pointer"
            onClick={() => setSelectedLeadsUser(user)} title="View Leads">
            <LayoutList className="h-4 w-4 text-[#0f3d6b]" />
          </Button>
          {user.role_id === 3 && (
            <Button variant="ghost" size="icon"
              className="h-8 w-8 rounded-lg hover:bg-blue-50 transition cursor-pointer"
              onClick={() => setViewAgentsManager(user)} title="View Experience Managers">
              <Users className="h-4 w-4 text-emerald-500" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <style>{`

        /* ══════════════════════════════════════════════════════
           1. TOP HEADER (White Background)
        ══════════════════════════════════════════════════════ */
        .rm-section-header {
          background: #FFFFFF !important;
          padding: 12px 16px 8px 16px; /* Ultra-tight title spacing */
        }
        .rm-section-header p {
          font-size: 16px; font-weight: 700; color: #111827; margin: 0;
        }

        /* ══════════════════════════════════════════════════════
           2. GRAY TRAY (Background for table and text headers)
        ══════════════════════════════════════════════════════ */
        .rm-table {
          width: 100%;
          background: transparent !important;
        }

        .rm-table .overflow-auto {
          background: #F5F7FA !important;
          padding: 0px 8px 0px 8px !important; /* EVEN TINIER grey spacing on left and right */
          border-radius: 0 !important; /* Touch edges */
        }

        /* Enforce Table Separation strictly! */
        .rm-table table {
          border-collapse: separate !important;
          border-spacing: 0 6px !important; /* Extremely tight stack between cards */
          width: 100%;
          background: transparent !important;
          margin-top: 0 !important;
          margin-bottom: 0 !important;
        }

        /* ══════════════════════════════════════════════════════
           3. TABLE HEADERS (Transparent over gray tray)
        ══════════════════════════════════════════════════════ */
        .rm-table thead,
        .rm-table thead tr {
          background: transparent !important;
          box-shadow: none !important;
        }

        .rm-table thead th {
          background: transparent !important;
          border: none !important;
          padding: 4px 12px !important;
          height: 26px !important;         /* fixed height */
          vertical-align: middle !important;
          text-align: left !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          color: #6B7280 !important;
          letter-spacing: 0.05em !important;
          text-transform: uppercase !important;
          display: table-cell !important;  /* ensure proper alignment */
        }

        /* Prevent previous custom button pill styles */
        .rm-table thead th button {
          background: transparent !important;
          border: none !important;
          padding: 0 !important;
          margin: 0 !important;
          height: auto !important;
          min-height: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: flex-start !important; /* FIX ZIGZAG 2 */
          text-align: left !important; /* FIX ZIGZAG 3 */
          width: 100% !important; /* Forces bounding box for flex-start */
          line-height: inherit !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          color: #6B7280 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
        }

        .rm-table thead th button:hover {
          background: transparent !important;
          color: #111827 !important;
        }

        .rm-table thead th:first-child { border-radius: 8px 0 0 8px !important; }
        .rm-table thead th:last-child { border-radius: 0 8px 8px 0 !important; }

        /* ══════════════════════════════════════════════════════
           4. PROFILE CARDS (Floating White Rows)
        ══════════════════════════════════════════════════════ */
        .rm-table tbody tr {
          background: #FFFFFF !important;
          box-shadow: 0px 2px 6px rgba(0,0,0,0.04) !important;
          border-radius: 12px !important;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .rm-table tbody tr:hover {
          transform: translateY(-2px);
          box-shadow: 0px 4px 12px rgba(0,0,0,0.08) !important;
        }

        /* Applying corner rounding via table cells */
        .rm-table tbody tr td:first-child { border-radius: 12px 0 0 12px !important; }
        .rm-table tbody tr td:last-child  { border-radius: 0 12px 12px 0 !important; }

        .rm-table tbody tr td {
          border: none !important;
          background: transparent !important;
          padding: 8px 16px !important; /* Ultra-thin internal card heights */
          vertical-align: middle !important;
          text-align: left !important; /* FIX ZIGZAG 4 */
        }

        /* ══════════════════════════════════════════════════════
           5. FOOTER (Bottom White Background)
        ══════════════════════════════════════════════════════ */
        .rm-table .justify-between {
          background: #FFFFFF !important;
          padding: 8px 16px !important; /* Cut footer padding tightly */
          border-top: 1px solid #F2F4F6 !important;
          border-radius: 0 !important; /* Edges must touch container padding */
          margin-top: 0 !important;
        }

        .rm-table button {
          border-radius: 8px !important;
          font-size: 13px;
          font-weight: 500;
          border: 1px solid transparent !important;
        }

        /* Data table specific active page override */
        .rm-table button.bg-\\[\\#0f3d6b\\]\\! {
          background: #1D4ED8 !important;
          color: #fff !important;
        }

        /* Normal button hover */
        .rm-table div > button:hover:not(.bg-\\[\\#0f3d6b\\]\\!) {
          background: #F3F4F6 !important;
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
    </div>
  );
};