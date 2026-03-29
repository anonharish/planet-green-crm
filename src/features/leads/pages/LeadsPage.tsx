import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { PageHeader } from "../../../shared/components/PageHeader/PageHeader";
import {
  FilterBar,
  SearchInput,
} from "../../../shared/components/FilterBar/FilterBar";
import { AppDrawer } from "../../../shared/components/AppDrawer/AppDrawer";
import { ConfirmDialog } from "../../../shared/components/ConfirmDialog/ConfirmDialog";
import { LeadForm } from "../components/LeadForm";
import { LeadTable } from "../components/LeadTable";
import { ScheduleVisitDialog } from "../components/ScheduleVisitDialog";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { toast } from "sonner";
import {
  useGetLeadsQuery,
  useCreateLeadMutation,
  useUpdateLeadMutation,
  useBulkAssignLeadsToRmMutation,
  useDeleteLeadMutation,
  useScheduleVisitMutation,
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
  const { currentRole, can } = usePermissions();
  const isAdmin =
    currentRole?.code === "ADMIN" || currentRole?.code === "SADMIN";
  const isRM = currentRole?.code === "RELMNG";
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

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showRandomConfirm, setShowRandomConfirm] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [deleteUuid, setDeleteUuid] = useState<string | null>(null);
  const [schedulingLead, setSchedulingLead] = useState<Lead | null>(null);

  // Data Fetching
  const { data: masterData } = useGetAllMasterDataQuery();
  const { data: rms = [] } = useGetAllUsersByRoleIdQuery({
    role_id: 3,
    offset: 0,
  });
  const { data: ems = [] } = useGetReporteesQuery(
    { reporting_manager_id: Number(rmIds[0] || 0), offset: 0 },
    { skip: rmIds.length === 0 },
  );

  const {
    data: leads = [],
    isLoading,
    isFetching,
  } = useGetLeadsQuery({
    offset: serverOffset,
    is_rm_assigned: isAdmin ? activeTab : undefined,
    is_em_assigned: isRM ? activeTab : undefined,
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
  });

  const [createLead, { isLoading: isCreating }] = useCreateLeadMutation();
  const [updateLead, { isLoading: isUpdating }] = useUpdateLeadMutation();
  const [bulkAssign, { isLoading: isBulkAssigning }] =
    useBulkAssignLeadsToRmMutation();
  const [deleteLead, { isLoading: isDeleting }] = useDeleteLeadMutation();
  const [scheduleVisit, { isLoading: isScheduling }] =
    useScheduleVisitMutation();

  const handleBulkAssign = async () => {
    if (!targetRmId || selectedUuids.length === 0) return;
    try {
      await bulkAssign({
        lead_uuids: selectedUuids,
        assigned_to_rm: Number(targetRmId),
      }).unwrap();
      toast.success("Leads successfully assigned to RM");
      dispatch(setSelectedUuids({ tabKey, uuids: [] }));
      setTargetRmId("");
    } catch (err: any) {
      toast.error(err?.data?.message || "Bulk assignment failed");
    }
  };

  const handleRandomAssign = async () => {
    if (leads.length === 0 || rms.length === 0) {
      toast.error("No leads or RMs available for assignment");
      return;
    }

    try {
      // Create a shuffled copy of leads
      const shuffledLeads = [...leads].sort(() => Math.random() - 0.5);
      const leadUuids = shuffledLeads.map((l) => l.uuid);

      // Calculate chunks
      const chunkSize = Math.ceil(leadUuids.length / rms.length);
      const assignmentPromises = [];

      for (let i = 0; i < rms.length; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, leadUuids.length);
        const chunk = leadUuids.slice(start, end);

        if (chunk.length > 0) {
          assignmentPromises.push(
            bulkAssign({
              lead_uuids: chunk,
              assigned_to_rm: rms[i].id,
            }).unwrap(),
          );
        }
      }

      await Promise.all(assignmentPromises);
      toast.success(
        `Successfully distributed ${leadUuids.length} leads across ${rms.length} RMs`,
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
    <div className="space-y-6">
      <PageHeader
        title="Leads Dashboard"
        description="Core CRM leads management and assignment platform"
        actions={
          <div className="flex gap-3">
            {can(PERMISSIONS.LEAD_BULK_ACTIONS) && (
              <Button
                variant="outline"
                onClick={() => setShowRandomConfirm(true)}
                disabled={isBulkAssigning || leads.length === 0}
                className="gap-2"
              >
                {isBulkAssigning ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Random Assign
              </Button>
            )}
            {can(PERMISSIONS.LEAD_CREATE) && (
              <Button onClick={handleCreateNew} className="gap-2">
                Add Lead
              </Button>
            )}
          </div>
        }
      />

      {showTabs && (
        <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl w-fit drop-shadow-sm border border-zinc-200/50 dark:border-zinc-800/50">
          <button
            onClick={() => dispatch(setActiveTabAction(0))}
            className={cn(
              "px-6 py-2.5 text-xs font-bold rounded-lg transition-all duration-200 uppercase tracking-wider",
              activeTab === 0
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm ring-1 ring-zinc-200/50 dark:ring-zinc-700/50"
                : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50",
            )}
          >
            Unassigned Leads
          </button>
          <button
            onClick={() => dispatch(setActiveTabAction(1))}
            className={cn(
              "px-6 py-2.5 text-xs font-bold rounded-lg transition-all duration-200 uppercase tracking-wider",
              activeTab === 1
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm ring-1 ring-zinc-200/50 dark:ring-zinc-700/50"
                : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50",
            )}
          >
            Assigned Leads
          </button>
        </div>
      )}

      <div className="border rounded-lg p-4 bg-white dark:bg-zinc-950 shadow-sm space-y-4">
        <FilterBar onReset={handleResetFilters}>
          <SearchInput
            value={search}
            onChange={(v) =>
              dispatch(
                updateTabFilters({ tabKey, updates: { search: v, page: 1 } }),
              )
            }
            placeholder="Search leads..."
          />

          <div className="w-48">
            <MultiSelect
              options={
                masterData?.lead_statuses.map((s) => ({
                  label: s.description,
                  value: String(s.id),
                })) || []
              }
              selected={statusIds}
              onChange={(v) =>
                dispatch(
                  updateTabFilters({
                    tabKey,
                    updates: { statusIds: v, page: 1 },
                  }),
                )
              }
              placeholder="Filter Status"
            />
          </div>

          <div className="w-48">
            <MultiSelect
              options={
                masterData?.projects.map((p) => ({
                  label: p.description,
                  value: String(p.id),
                })) || []
              }
              selected={projectIds}
              onChange={(v) =>
                dispatch(
                  updateTabFilters({
                    tabKey,
                    updates: { projectIds: v, page: 1 },
                  }),
                )
              }
              placeholder="Filter Project"
            />
          </div>

          <Select
            value={rmIds[0] || "all"}
            onValueChange={(v) =>
              dispatch(
                updateTabFilters({
                  tabKey,
                  updates: {
                    rmIds: v === "all" ? [] : [v],
                    emIds: [],
                    page: 1,
                  },
                }),
              )
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select RM" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All RMs</SelectItem>
              {rms.map((r) => (
                <SelectItem key={r.id} value={String(r.id)}>
                  {r.first_name} {r.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={emIds[0] || "all"}
            onValueChange={(v) =>
              dispatch(
                updateTabFilters({
                  tabKey,
                  updates: { emIds: v === "all" ? [] : [v], page: 1 },
                }),
              )
            }
            disabled={rmIds.length === 0}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select EM" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All EMs</SelectItem>
              {ems.map((e) => (
                <SelectItem key={e.id} value={String(e.id)}>
                  {e.first_name} {e.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterBar>

        {selectedUuids.length > 0 && can(PERMISSIONS.LEAD_BULK_ACTIONS) && (
          <div className="flex items-center justify-between p-3 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-lg animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                {selectedUuids.length} leads selected
              </span>
              <div className="flex items-center gap-2">
                <Select value={targetRmId} onValueChange={setTargetRmId}>
                  <SelectTrigger className="w-48 h-9 text-xs bg-white dark:bg-zinc-900 transition-all focus:ring-2 focus:ring-indigo-500">
                    <SelectValue placeholder="Select RM for assignment" />
                  </SelectTrigger>
                  <SelectContent>
                    {rms.map((r: any) => (
                      <SelectItem key={r.id} value={String(r.id)}>
                        {r.first_name} {r.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  disabled={!targetRmId || isBulkAssigning}
                  onClick={handleBulkAssign}
                  className="h-9 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md active:scale-95 transition-all px-4 font-bold"
                >
                  {isBulkAssigning ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Assign Selection"
                  )}
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
          onPageChange={(v) =>
            dispatch(updateTabFilters({ tabKey, updates: { page: v } }))
          }
          onLimitChange={(v) =>
            dispatch(
              updateTabFilters({ tabKey, updates: { limit: v, page: 1 } }),
            )
          }
          onEdit={handleEdit}
          onDelete={handleDelete}
          onScheduleVisit={handleScheduleVisit}
          onUpdateStatus={handleUpdateStatus}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
          offset={serverOffset}
          selectedUuids={selectedUuids}
          onSelectUuids={(uuids) =>
            dispatch(setSelectedUuids({ tabKey, uuids }))
          }
        />
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
        description={`This will equally and randomly distribute the ${leads.length} currently visible unassigned leads among the ${rms.length} available Relationship Managers. Are you sure?`}
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
    </div>
  );
};
