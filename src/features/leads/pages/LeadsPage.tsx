
import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { PageHeader } from "../../../shared/components/PageHeader/PageHeader";
import { SearchInput } from "../../../shared/components/FilterBar/FilterBar";
import { AppDrawer } from "../../../shared/components/AppDrawer/AppDrawer";
import { ConfirmDialog } from "../../../shared/components/ConfirmDialog/ConfirmDialog";
import { LeadForm } from "../components/LeadForm";
import { LeadTable } from "../components/LeadTable";
import { BulkActionsBar } from "../components/BulkActionsBar";
import { ScheduleVisitDialog } from "../components/ScheduleVisitDialog";
import { LeadActivityDialog } from "../components/LeadActivityDialog";
import { FilterDialog } from "../../../shared/components/FilterDialog/FilterDialog";
import { JunkReasonDialog } from "../components/JunkReasonDialog";
import { Loader2, UserPlus, SlidersHorizontal } from "lucide-react";
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
import { JunkLeadsPage } from './JunkLeadsPage';
import { LeadJunkReviewPage } from './LeadJunkReviewPage';
import { ReassignRMModal } from '../components/ReassignRMModal';
import type { JunkLead } from '../data/junkLeadsData';

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
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [showRandomConfirm, setShowRandomConfirm] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [deleteUuid, setDeleteUuid] = useState<string | null>(null);
  const [schedulingLead, setSchedulingLead] = useState<Lead | null>(null);
  const [activityLead, setActivityLead] = useState<Lead | null>(null);
  const [isJunkDialogOpen, setIsJunkDialogOpen] = useState(false);
  const [pendingJunkUpdate, setPendingJunkUpdate] = useState<{ lead: Lead; statusId: number } | null>(null);

  // Junk Leads Flow State
  const [activeView, setActiveView] = useState<string>('leads');
  const [selectedJunkLead, setSelectedJunkLead] = useState<Lead | null>(null);
  const [showReassignModal, setShowReassignModal] = useState(false);

  // Data Fetching
  const { data: masterData } = useGetAllMasterDataQuery();
  const { data: rms = [] } = useGetAllUsersByRoleIdQuery({
    role_id: 3,
    offset: 0,
  });

  const statusOptions = React.useMemo(() => {
    const options = masterData?.lead_statuses?.map((s: any) => ({
      value: String(s.id),
      label: s.description,
    })) || [];

    if (activeView === 'leads') {
      return options.filter((o: any) => {
        const s = masterData?.lead_statuses?.find((st: any) => String(st.id) === o.value);
        return s?.code !== 'JUNKPE' && s?.code !== 'JUNKCM';
      });
    }
    return options;
  }, [masterData, activeView]);

  const projectOptions = React.useMemo(() =>
    masterData?.projects?.map((p) => ({
      value: String(p.id),
      label: p.description,
    })) || [], [masterData]);

  const nonJunkStatusIds = React.useMemo(() => {
    if (!masterData?.lead_statuses) return [];
    return masterData.lead_statuses
      .filter((s: any) => s.code !== 'JUNKPE' && s.code !== 'JUNKCM')
      .map((s: any) => s.id);
  }, [masterData]);

  const queryStatusIds = React.useMemo(() =>
    debouncedFilters.statusIds.length > 0
      ? debouncedFilters.statusIds.map(Number)
      : (activeView === 'leads' ? nonJunkStatusIds : undefined)
    , [debouncedFilters.statusIds, activeView, nonJunkStatusIds]);

  const queryProjectIds = React.useMemo(() =>
    debouncedFilters.projectIds.length > 0
      ? debouncedFilters.projectIds.map(Number)
      : undefined
    , [debouncedFilters.projectIds]);

  const queryRmIds = React.useMemo(() =>
    debouncedFilters.rmIds.length > 0
      ? debouncedFilters.rmIds.map(Number)
      : undefined
    , [debouncedFilters.rmIds]);

  const queryEmIds = React.useMemo(() =>
    debouncedFilters.emIds.length > 0
      ? debouncedFilters.emIds.map(Number)
      : undefined
    , [debouncedFilters.emIds]);

  // Admin view uses getLeads
  const {
    data: adminLeads = [],
    isLoading: isAdminLoading,
    isFetching: isAdminFetching,
    refetch: refetchAdmin,
  } = useGetLeadsQuery({
    offset: serverOffset,
    is_rm_assigned: isAdmin ? (activeTab === 1 ? 1 : 0) : undefined,
    search_text: debouncedSearch || undefined,
    status: queryStatusIds,
    project: queryProjectIds,
    rm: queryRmIds,
    em: queryEmIds,
  }, { skip: !isAdmin });

  // RM view uses getLeadsByRmId
  const {
    data: rmLeads = [],
    isLoading: isRMLoading,
    isFetching: isRMFetching,
    refetch: refetchRM,
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
    refetch: refetchEM,
  } = useGetLeadsByEmIdQuery({
    assigned_to_em: Number(currentUser?.id || 0),
    offset: serverOffset,
  }, { skip: !isEM });
  const [addLeadActivity, { isLoading: isAddingActivity }] =
    useAddLeadActivityMutation();

  const handleRefetch = React.useCallback(() => {
    if (isAdmin) refetchAdmin();
    if (isRM) refetchRM();
    if (isEM) refetchEM();
  }, [isAdmin, isRM, isEM, refetchAdmin, refetchRM, refetchEM]);

  const leads = React.useMemo(() => {
    let list = isAdmin ? adminLeads : (isRM ? rmLeads : emLeads);
    // Exclude Junk and Junk Review statuses from the main Leads view
    if (activeView === 'leads') {
      return list.filter(l => {
        const s = masterData?.lead_statuses?.find(st => st.id === l.lead_status_id);
        return s?.code !== 'JUNKPE' && s?.code !== 'JUNKCM';
      });
    }
    return list;
  }, [isAdmin, adminLeads, isRM, rmLeads, isEM, emLeads, activeView, masterData]);

  const isLoading = isAdmin ? isAdminLoading : (isRM ? isRMLoading : isEMLoading);
  const isFetching = isAdmin ? isAdminFetching : (isRM ? isRMFetching : isEMFetching);

  // For EM assignment restricted to RM's reportees
  const { data: emsReportees = [] } = useGetReporteesQuery(
    { reporting_manager_id: Number(currentUser?.id || 0), offset: 0 },
    { skip: !isRM }
  );


  // Users listed in the bulk assignment dropdown: RMs for Admin, EMs for RM
  const assignmentUsers = isAdmin ? rms : emsReportees;

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
  const { data: managers = [] } = useGetAllUsersByRoleIdQuery({ role_id: 3, offset: 0 });
  const [deleteLead, { isLoading: isDeleting }] = useDeleteLeadMutation();
  const [scheduleVisit, { isLoading: isScheduling }] =
    useScheduleVisitMutation();

  const isAnyBulkAssigning = isBulkAssigning || isBulkAssignToEm;

  const handleBulkAssign = async (targetId: number, type: 'rm' | 'em') => {
    if (selectedUuids.length === 0) return;
    try {
      if (type === 'rm') {
        await bulkAssign({
          lead_uuids: selectedUuids,
          assigned_to_rm: targetId,
        }).unwrap();
        toast.success("Leads successfully assigned to RM");
      } else {
        await bulkAssignToEm({
          lead_uuids: selectedUuids,
          assigned_to_em: targetId,
        }).unwrap();
        toast.success("Leads successfully assigned to EM");
      }
      dispatch(setSelectedUuids({ tabKey, uuids: [] }));
    } catch (err: any) {
      toast.error(err?.data?.message || "Bulk assignment failed");
    }
  };

  const handleBulkMarkAsJunk = async () => {
    if (selectedUuids.length === 0) return;
    try {
      const promises = selectedUuids.map(uuid => deleteLead({ uuid }).unwrap());
      await Promise.all(promises);
      toast.success(`${selectedUuids.length} leads marked as junk`);
      dispatch(setSelectedUuids({ tabKey, uuids: [] }));
    } catch (err: any) {
      toast.error(err?.data?.message || "Bulk action failed");
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

  const handleCreateNew = React.useCallback(() => {
    setEditingLead(null);
    setIsDrawerOpen(true);
  }, []);

  const handleEdit = React.useCallback((lead: Lead) => {
    setEditingLead(lead);
    setIsDrawerOpen(true);
  }, []);

  const handleScheduleVisit = React.useCallback((lead: Lead) => {
    setSchedulingLead(lead);
  }, []);

  const handleDelete = React.useCallback((uuid: string) => {
    setDeleteUuid(uuid);
  }, []);

  const handleFormSubmit = async (values: CreateLeadRequest) => {
    try {
      if (editingLead) {
        await updateLead({ ...values, uuid: editingLead.uuid }).unwrap();
        toast.success("Lead updated successfully");
        if (values.assigned_to_rm) {
          dispatch(setActiveTabAction(1));
        }
        handleRefetch();
      } else {
        await createLead(values).unwrap();
        toast.success("Lead created successfully");
      }
      setIsDrawerOpen(false);
    } catch (err: any) {
      const errorMsg = err?.data?.message || err?.data?.error || err?.data?.detail || err?.message || "Operation failed";
      toast.error(errorMsg);
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

  const handleUpdateStatus = React.useCallback(async (lead: Lead, newStatusId: number) => {
    const junkStatus = masterData?.lead_statuses?.find(s => s.code === 'JUNKPE');
    if (junkStatus && newStatusId === junkStatus.id) {
      setPendingJunkUpdate({ lead, statusId: newStatusId });
      setIsJunkDialogOpen(true);
      return;
    }

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
  }, [updateLead, masterData]);

  const handleJunkReasonConfirm = async (reason: string) => {
    if (!pendingJunkUpdate) return;
    const { lead, statusId } = pendingJunkUpdate;
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
        lead_status_id: statusId,
        junk_reason: reason,
      };

      await updateLead(payload).unwrap();
      toast.success('Lead marked as junk for review!');
      setIsJunkDialogOpen(false);
      setPendingJunkUpdate(null);
    }
    catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update status');
    }
  };

  const handleAssignRm = React.useCallback(async (lead: Lead, rmId: number | null) => {
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
      handleRefetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to assign RM');
    }
  }, [updateLead, handleRefetch]);

  const handleAssignEm = React.useCallback(async (lead: Lead, emId: number | null) => {
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
      handleRefetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to assign EM');
    }
  }, [updateLead, handleRefetch]);

  const handlePageChange = React.useCallback((v: number) => {
    dispatch(updateTabFilters({ tabKey, updates: { page: v } }));
  }, [dispatch, tabKey]);

  const handleLimitChange = React.useCallback((v: number) => {
    dispatch(updateTabFilters({ tabKey, updates: { limit: v, page: 1 } }));
  }, [dispatch, tabKey]);

  const handleSelectUuids = React.useCallback((uuids: string[]) => {
    dispatch(setSelectedUuids({ tabKey, uuids }));
  }, [dispatch, tabKey]);

  // Local Sort logic for the current buffer
  const sortedLeads = React.useMemo(() => {
    const result = [...leads];
    result.sort((a, b) => {
      let valA: any = (a as any)[sortField];
      let valB: any = (b as any)[sortField];

      if (sortField === "created_on") {
        valA = a.created_on ? new Date(a.created_on).getTime() : 0;
        valB = b.created_on ? new Date(b.created_on).getTime() : 0;
      } else if (sortField === "customer_name") {
        valA = `${a.first_name || ""} ${a.last_name || ""}`.toLowerCase().trim();
        valB = `${b.first_name || ""} ${b.last_name || ""}`.toLowerCase().trim();
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
      {activeView === 'leads' || activeView === 'junk' ? (
        <PageHeader
          title={activeView === 'leads' ? "Leads Dashboard" : "Manage Junks"}
          description={activeView === 'leads' ? "Manage and track your sales pipeline efficiency" : "Streamline and audit the junk lead restoration process"}
          actions={
            activeView === 'leads' && can(PERMISSIONS.LEAD_CREATE) ? (
              <Button onClick={handleCreateNew} className="gap-2">
                <UserPlus size={18} />
                Create
              </Button>
            ) : undefined
          }
        />
      ) : null}

      {/* Search + Tabs Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="w-full sm:w-1/2">
          {activeView === 'leads' && (
            <SearchInput
              value={search}
              onChange={(v) =>
                dispatch(updateTabFilters({ tabKey, updates: { search: v, page: 1 } }))
              }
              placeholder="Search by Name or Phone Number"
            />
          )}
        </div>

        {showTabs && (
          <div className="flex items-center gap-2 p-2 bg-[#f0f2f5] dark:bg-zinc-900/50 rounded-xl w-fit border border-zinc-200/50 dark:border-zinc-800/50">
            <button
              onClick={() => {
                dispatch(setActiveTabAction(0));
                setActiveView('leads');
              }}
              style={{ 
                width: (activeTab === 0 && activeView === 'leads') ? '210.87px' : '155.8px',
                height: (activeTab === 0 && activeView === 'leads') ? '39px' : '36px'
              }}
              className={cn(
                "flex items-center justify-center gap-2 rounded-[8px] transition-all duration-200 text-sm font-bold",
                activeTab === 0 && activeView === 'leads'
                  ? "bg-white dark:bg-zinc-800 text-primary shadow-sm border border-zinc-200 pt-[7.5px] pb-[9.5px] px-6"
                  : "text-slate-500 hover:text-primary p-2 px-6",
              )}
            >
              Unassigned {(activeTab === 0 && activeView === 'leads') && <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] ml-1">24</span>}
            </button>
            <button
              onClick={() => {
                dispatch(setActiveTabAction(1));
                setActiveView('leads');
              }}
              style={{ 
                width: (activeTab === 1 && activeView === 'leads') ? '210.87px' : '155.8px',
                height: (activeTab === 1 && activeView === 'leads') ? '39px' : '36px'
              }}
              className={cn(
                "flex items-center justify-center gap-2 rounded-[8px] transition-all duration-200 text-sm font-bold",
                activeTab === 1 && activeView === 'leads'
                  ? "bg-white dark:bg-zinc-800 text-primary shadow-sm border border-zinc-200 pt-[7.5px] pb-[9.5px] px-6"
                  : "text-slate-500 hover:text-primary p-2 px-6",
              )}
            >
              Assigned
            </button>
            <button
              onClick={() => setActiveView('junk')}
              style={{ 
                width: (activeView === 'junk' || activeView === 'junk-review') ? '210.87px' : '155.8px',
                height: (activeView === 'junk' || activeView === 'junk-review') ? '39px' : '36px'
              }}
              className={cn(
                "flex items-center justify-center gap-2 rounded-[8px] transition-all duration-200 text-sm font-bold",
                activeView === 'junk' || activeView === 'junk-review'
                  ? "bg-white dark:bg-zinc-800 text-primary shadow-sm border border-zinc-200 pt-[7.5px] pb-[9.5px] px-6"
                  : "text-slate-500 hover:text-primary p-2 px-6",
              )}
            >
              Junk
            </button>
          </div>
        )}
      </div>

      {/* Main Table Card */}
      {activeView === 'leads' && (
        <div className="rounded-3xl border border-border/40 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
          <div className="flex items-center gap-2">
            <h2 
              className="font-bold text-[#191C1E] font-['Plus_Jakarta_Sans']"
              style={{ width: '175px', height: '28px', fontSize: '18px', lineHeight: '28px' }}
            >
              Leads Queue
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsFilterDialogOpen(true)}
              className="gap-3 relative h-11 rounded-[16px] px-6 border-zinc-200 dark:border-zinc-800 text-base font-bold text-primary bg-white shadow-sm hover:bg-zinc-50 transition-all ring-0 focus-visible:ring-0"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filter
              {(statusIds.length + projectIds.length + rmIds.length + emIds.length) > 0 && (
                <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 py-0.5 text-[10px] font-bold bg-primary text-white rounded-full">
                  {statusIds.length + projectIds.length + rmIds.length + emIds.length}
                </span>
              )}
            </Button>

            <FilterDialog
              open={isFilterDialogOpen}
              onClose={() => setIsFilterDialogOpen(false)}
              onApply={(filters) => {
                dispatch(updateTabFilters({ 
                  tabKey, 
                  updates: { 
                    ...filters,
                    page: 1 
                  } 
                }));
              }}
              onReset={() => {
                dispatch(resetTabFilters(tabKey));
                setIsFilterDialogOpen(false);
              }}
              statusIds={statusIds}
              statusOptions={statusOptions}
              projectIds={projectIds}
              projectOptions={projectOptions}
              rmIds={isAdmin ? rmIds : (currentUser?.id ? [String(currentUser.id)] : [])}
              emIds={emIds}
              rmOptions={rms}
              showRmFilter={isAdmin}
              showEmFilter={isAdmin || isRM}
            />

              {can(PERMISSIONS.LEAD_BULK_ACTIONS) && (
                <Button
                  onClick={() => setShowRandomConfirm(true)}
                  disabled={activeTab === 1 || isAnyBulkAssigning || leads.length === 0}
                  className="gap-2"
                >
                  {isAnyBulkAssigning ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Bulk Auto-Assign
                </Button>
              )}
            </div>
          </div>

          <div>

            <LeadTable
              data={sortedLeads}
              isLoading={isLoading || isFetching}
              page={page}
              limit={limit}
              total={totalLeads}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onScheduleVisit={handleScheduleVisit}
              onUpdateStatus={handleUpdateStatus}
              onAssignRm={handleAssignRm}
              onAssignEm={handleAssignEm}
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={handleSort}
              offset={serverOffset}
              selectedUuids={selectedUuids}
              onSelectUuids={handleSelectUuids}
              managers={managers}
            />
          </div>
        </div>
      )}

      {activeView === 'junk' && (
        <JunkLeadsPage
          isAdmin={isAdmin}
          onVerify={(lead) => {
            setSelectedJunkLead(lead);
            setActiveView('junk-review');
          }}
        />
      )}

      {activeView === 'junk-review' && selectedJunkLead && (
        <>
          <LeadJunkReviewPage
            lead={selectedJunkLead as unknown as Lead}
            onBack={() => setActiveView('junk')}
            onReassign={(reason) => {
              setShowReassignModal(true);
            }}
            onApprove={(reason) => {
              toast.success("Lead junk approved with reason: " + reason);
              setActiveView('junk');
            }}
          />
          <ReassignRMModal
            open={showReassignModal}
            rms={rms}
            onClose={() => setShowReassignModal(false)}
            lead={selectedJunkLead as unknown as Lead}
            onConfirm={(rmId) => {

              const _leadStatusId = masterData?.lead_statuses?.find(s => s.code === 'NEWLED')?.id;
              if (_leadStatusId) {
                const _lead = { ...selectedJunkLead, lead_status_id: _leadStatusId };
                handleAssignRm(_lead, rmId);
              }


              toast.success(`Lead successfully reassigned to RM ID: ${rmId}`);
              setActiveView('junk');
            }}
          />
        </>
      )}

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

      <JunkReasonDialog
        open={isJunkDialogOpen}
        onClose={() => {
          setIsJunkDialogOpen(false);
          setPendingJunkUpdate(null);
        }}
        onConfirm={handleJunkReasonConfirm}
        isLoading={isUpdating}
      />

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

      {selectedUuids.length > 0 && can(PERMISSIONS.LEAD_BULK_ACTIONS) && (
        <BulkActionsBar
          selectedCount={selectedUuids.length}
          rms={rms}
          ems={isAdmin ? ems : emsReportees}
          onAssignRm={(id) => handleBulkAssign(id, 'rm')}
          onAssignEm={(id) => handleBulkAssign(id, 'em')}
          onMarkAsJunk={handleBulkMarkAsJunk}
          onCancel={() => dispatch(setSelectedUuids({ tabKey, uuids: [] }))}
          isLoading={isAnyBulkAssigning || isDeleting}
          showAssignRm={isAdmin}
          showAssignEm={isRM}
        />
      )}

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