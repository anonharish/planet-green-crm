import React, { useState } from 'react';
import { DataTable } from '../../../shared/components/DataTable/DataTable';
import { Pencil, Trash2, MoreVertical, Eye, CalendarClock, ChevronDown, UserCircle2, User } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '../../../components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '../../../components/ui/command';
import type { Lead } from '../types';
import { type ColumnDef } from '../../../shared/components/DataTable/DataTable';
import { useMasterDataLookup } from '../../../shared/hooks/useMasterDataLookup';
import { usePermissions } from '../../../hooks/usePermissions';
import { PERMISSIONS } from '../../../config/permissions';
import { useGetAllUsersByRoleIdQuery, useGetReporteesQuery } from '../../users/api/usersApi';
import { cn } from '../../../utils';

import { Checkbox } from '../../../components/ui/checkbox';

// --- Initials Avatar ---
const InitialsAvatar = ({ firstName, lastName, size = 'sm' }: { firstName?: string; lastName?: string; size?: 'sm' | 'md' }) => {
  const initials = `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase() || '?';
  const sizeClasses = size === 'md' ? 'h-7 w-7 text-[10px]' : 'h-6 w-6 text-[9px]';
  return (
    <div className={cn(
      sizeClasses,
      "rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 flex items-center justify-center font-bold shrink-0"
    )}>
      {initials}
    </div>
  );
};

const UnassignedAvatar = () => (
  <div className="h-6 w-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
    <User className="h-3.5 w-3.5 text-zinc-400" />
  </div>
);

// --- Jira-style Assignee Popover for RM ---
const RmAssigneeCell = ({ lead, onAssign, managers, disabled }: {
  lead: Lead;
  onAssign: (lead: Lead, rmId: number | null) => void;
  managers: any[];
  disabled: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const assigned = managers.find((m: any) => m.id === lead.assigned_to_rm);

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild disabled={disabled}>
          <button
            className={cn(
              "flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all w-full min-w-28",
              "hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {assigned ? (
              <>
                <InitialsAvatar firstName={assigned.first_name} lastName={assigned.last_name} />
                <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate">
                  {assigned.first_name} {assigned.last_name}
                </span>
              </>
            ) : (
              <>
                <UnassignedAvatar />
                <span className="text-zinc-500 font-medium">Unassigned</span>
                <ChevronDown className="h-3.5 w-3.5 ml-auto text-zinc-400 shrink-0" />
              </>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-0" align="start">
          <Command>
            <CommandInput placeholder="Search RM..." className="h-9 text-xs" />
            <CommandEmpty className="py-3 text-xs text-center text-zinc-400">No RM found</CommandEmpty>
            <CommandGroup className="max-h-48 overflow-y-auto">
              {/* Unassigned option */}
              <CommandItem
                value="unassigned"
                onSelect={() => {
                  onAssign(lead, null);
                  setOpen(false);
                }}
                className="flex items-center gap-2 py-2 cursor-pointer"
              >
                <UnassignedAvatar />
                <span className="text-xs text-zinc-500 font-medium">Unassigned</span>
              </CommandItem>
              {managers.map((m: any) => (
                <CommandItem
                  key={m.id}
                  value={`${m.first_name} ${m.last_name}`}
                  onSelect={() => {
                    onAssign(lead, m.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-2 py-2 cursor-pointer",
                    lead.assigned_to_rm === m.id && "bg-primary/5"
                  )}
                >
                  <InitialsAvatar firstName={m.first_name} lastName={m.last_name} />
                  <span className="text-xs font-medium">{m.first_name} {m.last_name}</span>
                  {lead.assigned_to_rm === m.id && (
                    <span className="ml-auto text-[9px] text-primary font-bold">CURRENT</span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

// --- EM Popover Content (Lazy Loaded) ---
const EmAssigneePopoverContent = ({ 
  lead, 
  onAssign, 
  setOpen 
}: { 
  lead: Lead; 
  onAssign: (lead: Lead, emId: number | null) => void;
  setOpen: (open: boolean) => void;
}) => {
  const { data: reportees = [], isLoading: isLoadingReportees } = useGetReporteesQuery(
    { reporting_manager_id: lead.assigned_to_rm as number, offset: 0 },
    { skip: !lead.assigned_to_rm }
  );

  return (
    <Command>
      <CommandInput placeholder="Search EM..." className="h-9 text-xs" />
      <CommandEmpty className="py-3 text-xs text-center text-zinc-400">
        {isLoadingReportees ? 'Loading...' : 'No EM found'}
      </CommandEmpty>
      <CommandGroup className="max-h-48 overflow-y-auto">
        <CommandItem
          value="unassigned"
          onSelect={() => {
            onAssign(lead, null);
            setOpen(false);
          }}
          className="flex items-center gap-2 py-2 cursor-pointer"
        >
          <UnassignedAvatar />
          <span className="text-xs text-zinc-500 font-medium">Unassigned</span>
        </CommandItem>
        {reportees.map((em: any) => (
          <CommandItem
            key={em.id}
            value={`${em.first_name} ${em.last_name}`}
            onSelect={() => {
              onAssign(lead, em.id);
              setOpen(false);
            }}
            className={cn(
              "flex items-center gap-2 py-2 cursor-pointer",
              lead.assigned_to_em === em.id && "bg-primary/5"
            )}
          >
            <InitialsAvatar firstName={em.first_name} lastName={em.last_name} />
            <span className="text-xs font-medium">{em.first_name} {em.last_name}</span>
            {lead.assigned_to_em === em.id && (
              <span className="ml-auto text-[9px] text-primary font-bold">CURRENT</span>
            )}
          </CommandItem>
        ))}
      </CommandGroup>
    </Command>
  );
};

// --- Jira-style Assignee Cell for EM ---
const EmAssigneeCell = ({ lead, onAssign, disabled, emLabel }: {
  lead: Lead;
  onAssign: (lead: Lead, emId: number | null) => void;
  disabled: boolean;
  emLabel: string;
}) => {
  const [open, setOpen] = useState(false);
  const isDisabled = disabled || !lead.assigned_to_rm;

  const initials = emLabel !== '--' ? emLabel.split(' ').map(n => n[0]).join('') : '';

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Popover open={open} onOpenChange={(v) => { if (!isDisabled) setOpen(v); }}>
        <PopoverTrigger asChild disabled={isDisabled}>
          <button
            className={cn(
              "flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all w-full min-w-28",
              "hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer",
              isDisabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {lead.assigned_to_em ? (
              <>
                <div className="h-6 w-6 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 flex items-center justify-center font-bold shrink-0 text-[9px]">
                  {initials}
                </div>
                <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate">
                  {emLabel}
                </span>
              </>
            ) : (
              <>
                <UnassignedAvatar />
                <span className="text-zinc-500 font-medium">
                  {!lead.assigned_to_rm ? 'Select RM first' : 'Unassigned'}
                </span>
                <ChevronDown className="h-3.5 w-3.5 ml-auto text-zinc-400 shrink-0" />
              </>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-0" align="start">
          {open && (
            <EmAssigneePopoverContent 
              lead={lead} 
              onAssign={onAssign} 
              setOpen={setOpen} 
            />
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};


// --- Main LeadTable ---
interface LeadTableProps {
  data: Lead[];
  isLoading: boolean;
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (uuid: string) => void;
  onScheduleVisit: (lead: Lead) => void;
  onUpdateStatus?: (lead: Lead, newStatusId: number) => void;
  onLeadActivity?: (lead: Lead) => void;
  onAssignRm?: (lead: Lead, rmId: number | null) => void;
  onAssignEm?: (lead: Lead, emId: number | null) => void;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  // Selection
  selectedUuids?: string[];
  onSelectUuids?: (uuids: string[]) => void;
  offset?: number;
  maxHeight?: string;
  managers?: any[];
}

export const LeadTable = ({
  data,
  isLoading,
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
  onEdit,
  onDelete,
  onScheduleVisit,
  onUpdateStatus,
  onLeadActivity,
  onAssignRm,
  onAssignEm,
  sortField,
  sortOrder,
  onSort,
  selectedUuids = [],
  onSelectUuids,
  offset = 0,
  maxHeight,
  managers = []
}: LeadTableProps) => {
  const dataArray = data || [];
  const { currentRole, can } = usePermissions();
  const roleCode = currentRole?.code || '';
  
  const { 
    getStatusLabel, 
    getProjectLabel, 
    getRmLabel, 
    getEmLabel,
    getSourceLabel,
    masterData,
    isLoading: isLookupLoading 
  } = useMasterDataLookup();

  const fallback = (value: React.ReactNode) => value ?? '--';

  const columns: ColumnDef<Lead>[] = React.useMemo(() => [
    ...( can(PERMISSIONS.LEAD_BULK_ACTIONS) ? [
      {
        key: 'selection',
        header: (
          <div className="flex items-center justify-center h-full">
            <Checkbox 
              checked={dataArray.length > 0 && selectedUuids.length === dataArray.length}
              onCheckedChange={(checked: boolean) => {
                if (checked) {
                  onSelectUuids?.(dataArray.map(l => l.uuid));
                } else {
                  onSelectUuids?.([]);
                }
              }}
              aria-label="Select all"
            />
          </div>
        ),
        width: '40px',
        render: (l: Lead) => (
          <div className="flex items-center justify-center">
            <Checkbox 
              checked={selectedUuids.includes(l.uuid)}
              onCheckedChange={(checked: boolean) => {
                const newSelection = checked 
                  ? [...selectedUuids, l.uuid]
                  : selectedUuids.filter(id => id !== l.uuid);
                onSelectUuids?.(newSelection);
              }}
              aria-label={`Select lead ${l.lead_id}`}
            />
          </div>
        )
      }
    ] : []),
    {
      key: 'lead_id',
      header: 'LEAD ID',
      width: '110px',
      render: (l: Lead) => (
        <Link 
          to={`/leads/${l.uuid}`} 
          className="text-secondary-foreground font-semibold hover:text-primary transition-colors text-xs"
        >
          #{fallback(l.lead_id)}
        </Link>
      ),
    },
    {
      key: 'customer_name',
      header: 'CUSTOMER NAME',
      sortable: true,
      width: '150px',
      render: (l: Lead) => (
        <span className="font-bold text-primary text-xs">
          {fallback(l.first_name)} {l.last_name || ''}
        </span>
      ),
    },
    {
      key: 'contact_details',
      header: 'CONTACT DETAILS',
      width: '150px',
      render: (l: Lead) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-zinc-800 dark:text-zinc-100 font-medium text-xs">{fallback(l.phone_number)}</span>
          <span className="text-zinc-400 text-[11px] truncate">{l.email_address || '--'}</span>
        </div>
      ),
    },
    {
      key: 'source_id',
      header: 'SOURCE',
      width: '140px',
      render: (l: Lead) => (
        <span className="inline-block px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-source-bg text-primary">
          {getSourceLabel(l.source_id).split(' ')[0]}
        </span>
      ),
    },
    {
      key: 'project_id',
      header: 'PROJECT',
      width: '150px',
      render: (l: Lead) => <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{getProjectLabel(l.project_id)}</span>,
    },
    {
      key: 'lead_status_id',
      header: 'STATUS',
      sortable: true,
      width: '150px',
      render: (l: Lead) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Select 
            value={String(l.lead_status_id)} 
            disabled={!can(PERMISSIONS.LEAD_STATUS_UPDATE)}
            onValueChange={(val) => onUpdateStatus?.(l, Number(val))}
          >
            <SelectTrigger className="h-8 text-[11px] font-bold uppercase w-36 bg-source-bg text-primary border-2 border-primary/40 rounded-full focus:ring-0 px-4 hover:border-primary transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {masterData?.lead_statuses.map(s => (
                <SelectItem key={s.id} value={String(s.id)} className="text-[10px] uppercase font-bold">
                  {s.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ),
    },
    // Conditional: RM for Admin/Super Admin (SADMIN, ADMIN)
    ...( (roleCode === 'SADMIN' || roleCode === 'ADMIN') ? [
      {
        key: 'assigned_to_rm',
        header: 'ASSIGNED RM',
        width: '220px',
        render: (l: Lead) => (
          <RmAssigneeCell
            lead={l}
            onAssign={onAssignRm || (() => {})}
            managers={managers}
            disabled={!can(PERMISSIONS.LEAD_EDIT)}
          />
        ),
      }
    ] : []),
    // Conditional: EM for Admin/Super/RM (SADMIN, ADMIN, RELMNG)
    ...( (roleCode === 'SADMIN' || roleCode === 'ADMIN' || roleCode === 'RELMNG') ? [
      {
        key: 'assigned_to_em',
        header: 'ASSIGNED EM',
        width: '220px',
        render: (l: Lead) => (
          <EmAssigneeCell
            lead={l}
            onAssign={onAssignEm || (() => {})}
            disabled={!can(PERMISSIONS.LEAD_EDIT)}
            emLabel={getEmLabel(l.assigned_to_em)}
          />
        ),
      }
    ] : []),
    {
      key: 'actions',
      header: 'ACTIONS',
      width: '120px',
      render: (lead: Lead) => (
        <div className="flex items-center gap-1">
          {can(PERMISSIONS.LEAD_EDIT) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(lead)}
              className="h-8 text-[11px] font-bold uppercase rounded-xl border-zinc-200 dark:border-zinc-800 text-primary hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all px-4 shadow-none"
            >
              Edit Lead
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 text-xs">
              <DropdownMenuLabel className="font-normal text-zinc-500 uppercase px-3 py-2">
                Lead Actions
              </DropdownMenuLabel>
              <Link to={`/leads/${lead.uuid}`}>
                <DropdownMenuItem className="cursor-pointer gap-2 py-2">
                  <Eye className="h-4 w-4 text-zinc-500" />
                  <span>View Details</span>
                </DropdownMenuItem>
              </Link>
              {can(PERMISSIONS.LEAD_SCHEDULE_VISIT) && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onScheduleVisit(lead)} className="cursor-pointer gap-2 py-2">
                    <CalendarClock className="h-4 w-4 text-emerald-500" />
                    <span>Schedule Visit</span>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onLeadActivity?.(lead)}
                className="cursor-pointer gap-2 py-2"
              >
                <CalendarClock className="h-4 w-4 text-purple-500" />
                <span>Lead Activity</span>
              </DropdownMenuItem>
              {can(PERMISSIONS.LEAD_DELETE) && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDelete(lead.uuid)} 
                    className="cursor-pointer gap-2 py-2 text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Lead</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ], [data, selectedUuids, can, roleCode, masterData, managers, onAssignRm, onAssignEm, onUpdateStatus, onEdit, onScheduleVisit, onLeadActivity, onDelete, getSourceLabel, getProjectLabel, getEmLabel]);


  return (
    <DataTable
      columns={columns as ColumnDef<Lead>[]}
      data={dataArray}
      isLoading={isLoading || isLookupLoading}
      page={page}
      limit={limit}
      total={total}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
      rowKey={(l) => l.uuid}
      sortField={sortField}
      sortOrder={sortOrder}
      onSort={onSort as (key: string) => void}
      offset={offset}
      maxHeight={maxHeight}
    />
  );
};
