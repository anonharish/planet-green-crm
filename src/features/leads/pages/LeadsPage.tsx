import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { PageHeader } from "../../../shared/components/PageHeader/PageHeader";
import { SearchInput } from "../../../shared/components/FilterBar/FilterBar";
import { AppDrawer } from "../../../shared/components/AppDrawer/AppDrawer";
import { ConfirmDialog } from "../../../shared/components/ConfirmDialog/ConfirmDialog";
import { LeadForm } from "../components/LeadForm";
import { LeadTable } from "../components/LeadTable";
import { ScheduleVisitDialog } from "../components/ScheduleVisitDialog";
import { MetricCard } from "../../../shared/components/MetricCard/MetricCard";
import { LeadActivityDialog } from "../components/LeadActivityDialog";
import { Loader2, UserPlus } from "lucide-react";
import { FilterDialog } from "../../../shared/components/FilterDialog/FilterDialog";
import { Button } from "../../../components/ui/button";
import { toast } from "sonner";
import {
  useGetLeadsQuery,
  useCreateLeadMutation,
  useUpdateLeadMutation,
  useBulkAssignLeadsToRmMutation,
  useBulkAssignLeadsToEmMutation,
  useDeleteLeadMutation,
  useScheduleVisitMutation,
  useGetLeadsByRmIdQuery,
  useGetLeadsByEmIdQuery,
   useAddLeadActivityMutation,
} from "../api/leadsApi";
import { useGetAllMasterDataQuery } from "../../master/api/masterApi";
import {
  useGetAllUsersByRoleIdQuery,
  useGetReporteesQuery,
} from "../../users/api/usersApi";
import { usePermissions } from "../../../hooks/usePermissions";
import { PERMISSIONS } from "../../../config/permissions";
import { useDebounce } from "../../../shared/hooks/useDebounce";
import { MultiSelect } from "../../../components/ui/multi-select";
import { cn } from "../../../utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  setActiveTab as setActiveTabAction,
  updateTabFilters,
  resetTabFilters,
  setSelectedUuids,
} from "../store/leadsSlice";
import type { Lead, CreateLeadRequest, UpdateLeadRequest } from "../types";

export const LeadsPage = () => {
  const dispatch = useAppDispatch();
  const { currentRole, can, user: currentUser } = usePermissions();
  const isAdmin = currentRole?.code === "ADMIN" || currentRole?.code === "SADMIN";
  const isRM = currentRole?.code === "RELMNG";
  const isEM = currentRole?.code === "EXPMNG";
  const showTabs = isAdmin || isRM;

  const { activeTab, tabFilters } = useAppSelector((state) => state.leads);
  const tabKey = showTabs ? String(activeTab) : "all";
  const currentFilters = tabFilters[tabKey];

  const {
    page,
    limit,
    search,
    statusIds,
    projectIds,
    rmIds,
    emIds,
    sortField,
    sortOrder,
    selectedUuids,
  } = currentFilters;

  const [targetRmId, setTargetRmId] = useState<string>("");

  // Calculate server-side offset based on 200-record chunks
  const serverOffset = Math.floor(((page - 1) * limit) / 200) * 200;

  // Debouncing for API efficiency
  const debouncedSearch = useDebounce(search, 500);
  const debouncedFilters = useDebounce(
    { statusIds, projectIds, rmIds, emIds },
    300,
  );

  // Handlers
  const handleSort = (field: string) => {
    const newSortOrder =
      sortField === field && sortOrder === "asc" ? "desc" : "asc";
    dispatch(
      updateTabFilters({
        tabKey,
        updates: { sortField: field, sortOrder: newSortOrder },
      }),
    );
  };

  const handleResetFilters = () => {
    dispatch(resetTabFilters(tabKey));
  };

  const handleApplyFilters = (filters: {
    statusIds: string[];
    projectIds: string[];
    rmIds: string[];
    emIds: string[];
  }) => {
    dispatch(updateTabFilters({ tabKey, updates: { ...filters, page: 1 } }));
  };

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showRandomConfirm, setShowRandomConfirm] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [deleteUuid, setDeleteUuid] = useState<string | null>(null);
  const [schedulingLead, setSchedulingLead] = useState<Lead | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
    const [activityLead, setActivityLead] = useState<Lead | null>(null);

  // Data Fetching
  const { data: masterData } = useGetAllMasterDataQuery();
  const { data: rms = [] } = useGetAllUsersByRoleIdQuery({
    role_id: 3,
    offset: 0,
  });

  // Admin view uses getLeads
  const {
    data: adminLeads = [],
    isLoading: isAdminLoading,
    isFetching: isAdminFetching,
    refetch,
  } = useGetLeadsQuery({
    offset: serverOffset,
    is_rm_assigned: isAdmin ? (activeTab === 1 ? 1 : 0) : undefined,
    search_text: debouncedSearch || undefined,
    status:
      debouncedFilters.statusIds.length > 0
        ? debouncedFilters.statusIds.map(Number)
        : undefined,
    project:
      debouncedFilters.projectIds.length > 0
        ? debouncedFilters.projectIds.map(Number)
        : undefined,
    rm:
      debouncedFilters.rmIds.length > 0
        ? debouncedFilters.rmIds.map(Number)
        : undefined,
    em:
      debouncedFilters.emIds.length > 0
        ? debouncedFilters.emIds.map(Number)
        : undefined,
  }, { skip: !isAdmin });

  // RM view uses getLeadsByRmId
  const {
    data: rmLeads = [],
    isLoading: isRMLoading,
    isFetching: isRMFetching,
  } = useGetLeadsByRmIdQuery({
    assigned_to_rm: Number(currentUser?.id || 0),
    offset: serverOffset,
    is_em_assigned: activeTab,
  }, { skip: !isRM });

  // EM view uses getLeadsByEmId
  const {
    data: emLeads = [],
    isLoading: isEMLoading,
    isFetching: isEMFetching,
  } = useGetLeadsByEmIdQuery({
    assigned_to_em: Number(currentUser?.id || 0),
    offset: serverOffset,
  }, { skip: !isEM });
  const [addLeadActivity, { isLoading: isAddingActivity }] = 
    useAddLeadActivityMutation();

  const leads = isAdmin ? adminLeads : (isRM ? rmLeads : emLeads);
  const isLoading = isAdmin ? isAdminLoading : (isRM ? isRMLoading : isEMLoading);
  const isFetching = isAdmin ? isAdminFetching : (isRM ? isRMFetching : isEMFetching);

  // For EM assignment restricted to RM's reportees
  const { data: emsReportees = [] } = useGetReporteesQuery(
    { reporting_manager_id: Number(currentUser?.id || 0), offset: 0 },
    { skip: !isRM }
  );

  // Users listed in the bulk assignment dropdown: RMs for Admin, EMs for RM
  const assignmentUsers = isAdmin ? rms : emsReportees;
  const assignmentLabel = isAdmin ? "Select RM for assignment" : "Select EM for assignment";

  const { data: ems = [] } = useGetReporteesQuery(
    { reporting_manager_id: Number(rmIds[0] || 0), offset: 0 },
    { skip: rmIds.length === 0 },
  );

  const [createLead, { isLoading: isCreating }] = useCreateLeadMutation();
  const [updateLead, { isLoading: isUpdating }] = useUpdateLeadMutation();
  const [bulkAssign, { isLoading: isBulkAssigning }] =
    useBulkAssignLeadsToRmMutation();
  const [bulkAssignToEm, { isLoading: isBulkAssignToEm }] = 
    useBulkAssignLeadsToEmMutation();
  const [deleteLead, { isLoading: isDeleting }] = useDeleteLeadMutation();
  const [scheduleVisit, { isLoading: isScheduling }] =
    useScheduleVisitMutation();

  const isAnyBulkAssigning = isBulkAssigning || isBulkAssignToEm;

  const handleBulkAssign = async () => {
    if (!targetRmId || selectedUuids.length === 0) return;
    try {
      if (isAdmin) {
        await bulkAssign({
          lead_uuids: selectedUuids,
          assigned_to_rm: Number(targetRmId),
        }).unwrap();
        toast.success("Leads successfully assigned to RM");
      } else if (isRM) {
        await bulkAssignToEm({
          lead_uuids: selectedUuids,
          assigned_to_em: Number(targetRmId),
        }).unwrap();
        toast.success("Leads successfully assigned to EM");
      }
      dispatch(setSelectedUuids({ tabKey, uuids: [] }));
      setTargetRmId("");
    } catch (err: any) {
      toast.error(err?.data?.message || "Bulk assignment failed");
    }
  };

  const handleLeadActivity = (lead: Lead) => {
    setActivityLead(lead);
  };

  const handleLeadActivitySubmit = async (data: any) => {
    try {
      await addLeadActivity(data).unwrap();
      toast.success("Activity added successfully");
      setActivityLead(null);
    } catch (err: unknown) {
      toast.error((err as { data?: { message?: string } })?.data?.message || "Failed to add activity");
    }
  };

  const handleRandomAssign = async () => {
    if (leads.length === 0 || assignmentUsers.length === 0) {
      toast.error(`No leads or ${isAdmin ? "RMs" : "EMs"} available for assignment`);
      return;
    }

    try {
      const shuffledLeads = [...leads].sort(() => Math.random() - 0.5);
      const leadUuids = shuffledLeads.map((l) => l.uuid);
      const chunkSize = Math.ceil(leadUuids.length / assignmentUsers.length);
      const assignmentPromises = [];

      for (let i = 0; i < assignmentUsers.length; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, leadUuids.length);
        const chunk = leadUuids.slice(start, end);

        if (chunk.length > 0) {
          if (isAdmin) {
            assignmentPromises.push(
              bulkAssign({
                lead_uuids: chunk,
                assigned_to_rm: assignmentUsers[i].id,
              }).unwrap(),
            );
          } else if (isRM) {
            assignmentPromises.push(
              bulkAssignToEm({
                lead_uuids: chunk,
                assigned_to_em: assignmentUsers[i].id,
              }).unwrap(),
            );
          }
        }
      }

      await Promise.all(assignmentPromises);
      toast.success(
        `Successfully distributed ${leadUuids.length} leads across ${assignmentUsers.length} ${isAdmin ? "RMs" : "EMs"}`,
      );
    } catch (err: any) {
      toast.error(err?.data?.message || "Random assignment failed");
    }
  };

  const handleCreateNew = () => {
    setEditingLead(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setIsDrawerOpen(true);
  };

  const handleScheduleVisit = (lead: Lead) => {
    setSchedulingLead(lead);
  };

  const handleDelete = (uuid: string) => {
    setDeleteUuid(uuid);
  };

const handleFormSubmit = async (values: CreateLeadRequest) => {
  try {
    if (editingLead) {
      await updateLead({ ...values, uuid: editingLead.uuid }).unwrap();
      toast.success("Lead updated successfully");
      if (values.assigned_to_rm) {
        dispatch(setActiveTabAction(1));
      }
      refetch();
    } else {
      await createLead(values).unwrap();
      toast.success("Lead created successfully");
    }
    setIsDrawerOpen(false);
  } catch (err: any) {
    toast.error(err?.data?.message || "Operation failed");
  }
};

  const handleScheduleVisitSubmit = async (data: any) => {
    try {
      await scheduleVisit(data).unwrap();
      toast.success("Visit scheduled successfully");
      setSchedulingLead(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to schedule visit");
    }
  };

  const handleUpdateStatus = async (lead: Lead, newStatusId: number) => {
    try {
      const payload: UpdateLeadRequest = {
        uuid: lead.uuid,
        first_name: lead.first_name || '',
        last_name: lead.last_name || '',
        phone_number: lead.phone_number || '',
        email_address: lead.email_address || '',
        occupation: lead.occupation || '',
        address: lead.address || '',
        city: lead.city || '',
        state: lead.state || '',
        country: lead.country || '',
        zip: lead.zip || '',
        source_id: lead.source_id,
        source_employee_user_id: lead.source_employee_user_id || null,
        project_id: lead.project_id,
        assigned_to_rm: lead.assigned_to_rm || null,
        assigned_to_em: lead.assigned_to_em || null,
        lead_priority_id: lead.lead_priority_id || 1,
        lead_status_id: newStatusId,
      };
      
      await updateLead(payload).unwrap();
      toast.success('Status updated successfully!');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update status');
    }
  };

  const handleAssignRm = async (lead: Lead, rmId: number | null) => {
    try {
      const payload: UpdateLeadRequest = {
        uuid: lead.uuid,
        first_name: lead.first_name || '',
        last_name: lead.last_name || '',
        phone_number: lead.phone_number || '',
        email_address: lead.email_address || '',
        occupation: lead.occupation || '',
        address: lead.address || '',
        city: lead.city || '',
        state: lead.state || '',
        country: lead.country || '',
        zip: lead.zip || '',
        source_id: lead.source_id,
        source_employee_user_id: lead.source_employee_user_id || null,
        project_id: lead.project_id,
        assigned_to_rm: rmId,
        assigned_to_em: rmId !== lead.assigned_to_rm ? null : (lead.assigned_to_em || null),
        lead_priority_id: lead.lead_priority_id || 1,
        lead_status_id: lead.lead_status_id,
      };
      await updateLead(payload).unwrap();
      toast.success(rmId ? 'RM assigned successfully!' : 'RM unassigned');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to assign RM');
    }
  };

  const handleAssignEm = async (lead: Lead, emId: number | null) => {
    try {
      const payload: UpdateLeadRequest = {
        uuid: lead.uuid,
        first_name: lead.first_name || '',
        last_name: lead.last_name || '',
        phone_number: lead.phone_number || '',
        email_address: lead.email_address || '',
        occupation: lead.occupation || '',
        address: lead.address || '',
        city: lead.city || '',
        state: lead.state || '',
        country: lead.country || '',
        zip: lead.zip || '',
        source_id: lead.source_id,
        source_employee_user_id: lead.source_employee_user_id || null,
        project_id: lead.project_id,
        assigned_to_rm: lead.assigned_to_rm || null,
        assigned_to_em: emId,
        lead_priority_id: lead.lead_priority_id || 1,
        lead_status_id: lead.lead_status_id,
      };
      await updateLead(payload).unwrap();
      toast.success(emId ? 'EM assigned successfully!' : 'EM unassigned');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to assign EM');
    }
  };

  // Local Sort logic for the current buffer
  const sortedLeads = React.useMemo(() => {
    let result = [...leads];
    result.sort((a, b) => {
      let valA: any = (a as any)[sortField];
      let valB: any = (b as any)[sortField];

      if (sortField === "created_on") {
        valA = a.created_on ? new Date(a.created_on).getTime() : 0;
        valB = b.created_on ? new Date(b.created_on).getTime() : 0;
      } else {
        valA = typeof valA === "string" ? valA.toLowerCase() : (valA ?? "");
        valB = typeof valB === "string" ? valB.toLowerCase() : (valB ?? "");
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return result;
  }, [leads, sortField, sortOrder]);

  const totalLeads =
    leads.length < 200 ? serverOffset + leads.length : serverOffset + 201;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Leads Dashboard"
        description="Manage and track your sales pipeline efficiency"
        actions={
          can(PERMISSIONS.LEAD_CREATE) ? (
            <Button onClick={handleCreateNew} className="gap-2">
              <UserPlus size={18} />
              Create
            </Button>
          ) : undefined
        }
      />

      {/* Search + Tabs Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="w-full sm:w-1/2">
          <SearchInput
            value={search}
            onChange={(v) =>
              dispatch(updateTabFilters({ tabKey, updates: { search: v, page: 1 } }))
            }
            placeholder="Search leads by name"
          />
        </div>

        {showTabs && (
          <div className="flex items-center gap-2 p-2 bg-[#f0f2f5] dark:bg-zinc-900/50 rounded-xl w-fit border border-zinc-200/50 dark:border-zinc-800/50">
            <button
              onClick={() => dispatch(setActiveTabAction(0))}
              className={cn(
                "flex items-center gap-2.5 px-5 py-2 text-sm font-bold rounded-md transition-all duration-200",
                activeTab === 0
                  ? "bg-white dark:bg-zinc-800 text-primary shadow-sm"
                  : "text-slate-500 hover:text-primary",
              )}
            >
              Unassigned
            </button>
            <button
              onClick={() => dispatch(setActiveTabAction(1))}
              className={cn(
                "flex items-center gap-2.5 px-5 py-2 text-sm font-bold rounded-md transition-all duration-200",
                activeTab === 1
                  ? "bg-white dark:bg-zinc-800 text-primary shadow-sm"
                  : "text-slate-500 hover:text-primary",
              )}
            >
              Assigned
            </button>
            <button
              className="px-5 py-2 text-sm font-bold rounded-md text-slate-500 hover:text-primary transition-all duration-200"
            >
              Junk
            </button>
          </div>
        )}
      </div>

      {/* Main Table Card */}
      <div className="rounded-3xl border border-border/40 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-foreground">Leads Queue</h2>
            {/* <span className="w-2 h-2 rounded-full bg-emerald-500" /> */}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setFilterOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" /></svg>
              Filter
              {(statusIds.length + projectIds.length + rmIds.length + emIds.length) > 0 && (
                <span className="px-1.5 py-0.5 text-xs font-bold bg-primary text-primary-foreground rounded-full">
                  {statusIds.length + projectIds.length + rmIds.length + emIds.length}
                </span>
              )}
            </Button>

            <FilterDialog
              open={filterOpen}
              onClose={() => setFilterOpen(false)}
              onApply={handleApplyFilters}
              onReset={handleResetFilters}
              statusIds={statusIds}
              projectIds={projectIds}
              rmIds={rmIds}
              emIds={emIds}
              statusOptions={(masterData?.lead_statuses || []).map((s) => ({ value: String(s.id), label: s.description }))}
              projectOptions={(masterData?.projects || []).map((p) => ({ value: String(p.id), label: p.description }))}
              rmOptions={rms}
              showRmFilter={isAdmin}
              showEmFilter={isAdmin || isRM}
            />

            {can(PERMISSIONS.LEAD_BULK_ACTIONS) && (
              <Button
                onClick={() => setShowRandomConfirm(true)}
                disabled={activeTab === 0 || isAnyBulkAssigning || leads.length === 0}
                className="gap-2"
              >
                {isAnyBulkAssigning ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Bulk Auto-Assign
              </Button>
            )}
          </div>
        </div>

        <div className="p-4 space-y-4">
          {selectedUuids.length > 0 && can(PERMISSIONS.LEAD_BULK_ACTIONS) && (
            <div className="flex items-center justify-between p-3 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-xl animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                  {selectedUuids.length} selected
                </span>
                <div className="flex items-center gap-2">
                  <Select value={targetRmId} onValueChange={setTargetRmId}>
                    <SelectTrigger className="w-48 h-9 text-xs bg-white dark:bg-zinc-950">
                      <SelectValue placeholder={assignmentLabel} />
                    </SelectTrigger>
                    <SelectContent>
                      {assignmentUsers.map((r: any) => (
                        <SelectItem key={r.id} value={String(r.id)}>{r.first_name} {r.last_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    disabled={!targetRmId || isAnyBulkAssigning}
                    onClick={handleBulkAssign}
                    className="h-9 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md px-4 font-bold"
                  >
                    {isAnyBulkAssigning ? <Loader2 className="h-4 w-4 animate-spin" /> : "Assign Selection"}
                  </Button>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(setSelectedUuids({ tabKey, uuids: [] }))}
                className="text-zinc-500 hover:text-zinc-800 font-medium"
              >
                Cancel
              </Button>
            </div>
          )}

          <LeadTable
            data={sortedLeads}
            isLoading={isLoading || isFetching}
            page={page}
            limit={limit}
            total={totalLeads}
            onPageChange={(v) => dispatch(updateTabFilters({ tabKey, updates: { page: v } }))}
            onLimitChange={(v) => dispatch(updateTabFilters({ tabKey, updates: { limit: v, page: 1 } }))}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onScheduleVisit={handleScheduleVisit}
            onLeadActivity={handleLeadActivity}
            onUpdateStatus={handleUpdateStatus}
            onAssignRm={handleAssignRm}
            onAssignEm={handleAssignEm}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
            offset={serverOffset}
            maxHeight="calc(100vh - 200px)"
            selectedUuids={selectedUuids}
            onSelectUuids={(uuids) => dispatch(setSelectedUuids({ tabKey, uuids }))}
          />
        </div>
      </div>

      <AppDrawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingLead ? "Edit Lead" : "New Lead"}
        description={
          editingLead
            ? "Modify lead details below."
            : "Fill in the information to register a new property lead."
        }
      >
        {isDrawerOpen && (
          <LeadForm
            onSubmit={handleFormSubmit}
            isLoading={isCreating || isUpdating}
            initialValues={editingLead || undefined}
            isEdit={!!editingLead}
          />
        )}
      </AppDrawer>

      <ConfirmDialog
        open={showRandomConfirm}
        onClose={() => setShowRandomConfirm(false)}
        onConfirm={() => {
          handleRandomAssign();
          setShowRandomConfirm(false);
        }}
        title="Confirm Random Assignment"
        description={`This will equally and randomly distribute the ${leads.length} currently visible ${activeTab === 0 ? "unassigned" : "assigned"} leads among the ${assignmentUsers.length} available ${isAdmin ? "Relationship Managers" : "Experience Managers"}. Are you sure?`}
        confirmLabel="Assign Leads"
        variant="primary"
      />

      <ConfirmDialog
        open={!!deleteUuid}
        onClose={() => setDeleteUuid(null)}
        onConfirm={async () => {
          if (!deleteUuid) return;
          try {
            await deleteLead({ uuid: deleteUuid }).unwrap();
            toast.success("Lead deleted successfully");
            setDeleteUuid(null);
          } catch (err: any) {
            toast.error(err?.data?.message || "Failed to delete lead");
          }
        }}
        isLoading={isDeleting}
        title="Delete Lead"
        description="Are you sure you want to remove this lead? This action cannot be undone."
      />

      <ScheduleVisitDialog
        open={!!schedulingLead}
        onClose={() => setSchedulingLead(null)}
        lead={schedulingLead}
        siteVisitStatuses={
          masterData?.site_visit_status ||
          (masterData as any)?.site_visit_statuses ||
          []
        }
        rms={rms}
        onSubmit={handleScheduleVisitSubmit}
        isLoading={isScheduling}
      />

      <LeadActivityDialog
        key={activityLead?.uuid || 'activity-dialog'}
        open={!!activityLead}
        onClose={() => setActivityLead(null)}
        lead={activityLead}
        onSubmit={handleLeadActivitySubmit}
        isLoading={isAddingActivity}
      />
    </div>
  );
};