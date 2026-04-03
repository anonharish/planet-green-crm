import React, { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2,CalendarIcon  } from "lucide-react";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";
import { Calendar } from "../../../components/ui/calendar";
import { useGetReporteesQuery } from "../../users/api/usersApi";
import { usePermissions } from "../../../hooks/usePermissions";
import { cn } from "../../../utils";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

import type { Lead, ScheduleVisitRequest } from "../types";
import { useGetLeadsQuery } from "../api/leadsApi";

const scheduleVisitSchema = z.object({
  visit_date_time: z.string().min(1, "Date and time are required"),
  visit_location_url: z.string().url("Must be a valid URL"),
  visit_status: z.number().min(1, "Status is required"),
  visit_assigned_to_rm: z.number().min(1, "RM assignment is required"),
  visit_assigned_to_em: z.number().min(1, "EM assignment is required"),
  visit_remarks: z.string().optional(),
});

type ScheduleVisitFormValues = z.infer<typeof scheduleVisitSchema>;

interface ScheduleVisitDialogProps {
  open: boolean;
  onClose: () => void;
  lead: Lead | null;
  siteVisitStatuses: { id: number; description: string }[];
  rms: { id: number; first_name: string; last_name: string }[];
  // ems is unused now as we fetch reportees directly
  onSubmit: (data: ScheduleVisitRequest) => Promise<void>;
  isLoading: boolean;
}

export const ScheduleVisitDialog = ({
  open,
  onClose,
  lead,
  siteVisitStatuses,
  rms,
  onSubmit,
  isLoading,
}: ScheduleVisitDialogProps) => {
  const { user: currentUser, roleCode } = usePermissions();
  const isRM = roleCode === "RELMNG";

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ScheduleVisitFormValues>({
    resolver: zodResolver(scheduleVisitSchema),
    defaultValues: {
      visit_date_time: "",
      visit_location_url: "",
      visit_status: undefined,
      visit_assigned_to_rm: undefined,
      visit_assigned_to_em: undefined,
      visit_remarks: "",
    },
  });

  const watchStatus = useWatch({ control, name: "visit_status" });
  const watchRm = useWatch({ control, name: "visit_assigned_to_rm" });
  const watchEm = useWatch({ control, name: "visit_assigned_to_em" });

  
  const [date, setDate] = useState<Date | undefined>();
  const [hour, setHour] = useState("10");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState<"AM" | "PM">("AM");

  const convertTo12Hour = (dateTime: string) => {
    if (!dateTime) return "";

    const date = new Date(dateTime);
    let hours = date.getHours();
    const minutes = date.getMinutes();

    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    return `${hours}:${String(minutes).padStart(2, "0")} ${period}`;
  };


  const { data: reportees = [], isLoading: isLoadingReportees } =
    useGetReporteesQuery(
      { reporting_manager_id: watchRm as number, offset: 0 },
      { skip: !watchRm },
    );

  useEffect(() => {
    // Clear EM selection if RM changes after initial load
    if (watchRm && watchEm) {
      const emExists = reportees.some((r) => r.id === watchEm);
      if (!isLoadingReportees && reportees.length > 0 && !emExists) {
        setValue("visit_assigned_to_em", undefined as unknown as number);
      }
    }
  }, [watchRm, reportees, isLoadingReportees, watchEm, setValue]);

  const scheduledStatus = siteVisitStatuses.find(s => s.description.toUpperCase() === 'SCHEDULED' || (s as any).code === 'SCHDLD');
  const scheduledStatusId = scheduledStatus?.id || 1;

  useEffect(() => {
    if (open && lead) {
      reset({
        visit_date_time: "",
        visit_location_url: "",
        visit_status: scheduledStatusId,
        visit_assigned_to_rm: isRM
          ? Number(currentUser?.id)
          : lead.assigned_to_rm || undefined,
        visit_assigned_to_em: lead.assigned_to_em || undefined,
        visit_remarks: "",
      });
    } else if (open && !lead) {
      reset({
        visit_date_time: "",
        visit_location_url: "",
        visit_status: scheduledStatusId,
        visit_assigned_to_rm: isRM ? Number(currentUser?.id) : undefined,
        visit_assigned_to_em: undefined,
        visit_remarks: "",
      });
    }
  }, [open, lead, reset, isRM, currentUser, scheduledStatusId]);

  const [selectedLeadUuid, setSelectedLeadUuid] = useState<string>("");
  const { data: leadsData, isLoading: isLoadingLeads } = useGetLeadsQuery({ offset: 0 }, { skip: !!lead });
  const allLeads = leadsData?.data || [];

  const handleFormSubmit = async (data: ScheduleVisitFormValues) => {
      if (!date || (!lead && !selectedLeadUuid)) return;

    let hrs = parseInt(hour);

    if (period === "PM" && hrs !== 12) hrs += 12;
    if (period === "AM" && hrs === 12) hrs = 0;

    const formattedDate = `${format(date, "yyyy-MM-dd")} ${String(
      hrs,
    ).padStart(2, "0")}:${minute}:00`;

    await onSubmit({
      ...data,
      visit_status: scheduledStatusId,
      visit_date_time: formattedDate,
      lead_uuid: lead ? (lead as Lead).uuid : selectedLeadUuid,
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
       <div className="bg-white dark:bg-zinc-950 w-full max-w-lg rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[75vh]">
        <div className="px-6 py-4 border-b bg-zinc-50/50">
          <h2 className="text-lg font-bold">Schedule Visit</h2>
          <p className="text-sm text-zinc-500">
            {lead ? `Schedule a site visit for ${lead.first_name} ${lead.last_name}` : "Schedule a site visit for a lead"}
          </p>
        </div>

        <div className="p-6 overflow-y-auto">
          <form
            id="schedule-visit-form"
            onSubmit={handleSubmit(handleFormSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              {!lead && (
                <div className="space-y-2 mb-4">
                  <Label>Select Lead *</Label>
                  <Select value={selectedLeadUuid} onValueChange={setSelectedLeadUuid} disabled={isLoadingLeads}>
                    <SelectTrigger>
                      <SelectValue placeholder="Search / Select a lead" />
                    </SelectTrigger>
                    <SelectContent>
                      {allLeads.map((l: Lead) => (
                        <SelectItem key={l.uuid} value={l.uuid}>
                          {l.first_name} {l.last_name} ({l.lead_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Label>Visit Date & Time *</Label>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date
                      ? `${format(date, "PPP")} ${hour}:${minute} ${period}`
                      : "Pick date & time"}
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="p-4 space-y-4">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(selectedDate) => {
                      setDate(selectedDate);
                      if (selectedDate) {
                        setValue("visit_date_time", "selected");
                      }
                    }}
                  />

                  <div className="flex gap-2 justify-center">
                    <select value={hour} onChange={(e) => setHour(e.target.value)}>
                      {Array.from({ length: 12 }, (_, i) => {
                        const val = String(i + 1).padStart(2, "0");
                        return <option key={val}>{val}</option>;
                      })}
                    </select>

                    :

                    <select value={minute} onChange={(e) => setMinute(e.target.value)}>
                      {["00", "15", "30", "45"].map((m) => (
                        <option key={m}>{m}</option>
                      ))}
                    </select>

                    <select
                      value={period}
                      onChange={(e) =>
                        setPeriod(e.target.value as "AM" | "PM")
                      }
                    >
                      <option>AM</option>
                      <option>PM</option>
                    </select>
                  </div>
                </PopoverContent>
              </Popover>
              {errors.visit_date_time && (
                <p className="text-xs text-red-500">
                  {errors.visit_date_time.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="visit_location_url">Location URL *</Label>
              <Input
                id="visit_location_url"
                type="url"
                placeholder="https://maps.google.com/..."
                disabled={isLoading}
                {...register("visit_location_url")}
                className={errors.visit_location_url ? "border-red-500" : ""}
              />
              {errors.visit_location_url && (
                <p className="text-xs text-red-500">
                  {errors.visit_location_url.message}
                </p>
              )}
            </div>

            {/* Hidden Status - forced to 'SCHDLD' */}
            <input type="hidden" {...register("visit_status")} />

            <div className={cn("grid gap-4", isRM ? "grid-cols-1" : "grid-cols-2")}>
              {!isRM && (
                <div className="space-y-2">
                  <Label>Assigned RM *</Label>
                  <Select
                    value={watchRm?.toString() || ""}
                    onValueChange={(val) =>
                      setValue("visit_assigned_to_rm", Number(val))
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger
                      className={
                        errors.visit_assigned_to_rm ? "border-red-500" : ""
                      }
                  >
                      <SelectValue placeholder="Select RM" />
                    </SelectTrigger>
                    <SelectContent>
                      {rms.map((r) => (
                        <SelectItem key={r.id} value={String(r.id)}>
                          {r.first_name} {r.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.visit_assigned_to_rm && (
                    <p className="text-xs text-red-500">
                      {errors.visit_assigned_to_rm.message}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label>Assigned EM *</Label>
                <Select
                  value={watchEm?.toString() || ""}
                  onValueChange={(val) =>
                    setValue("visit_assigned_to_em", Number(val))
                  }
                  disabled={isLoading || !watchRm}
                >
                  <SelectTrigger
                    className={
                      errors.visit_assigned_to_em ? "border-red-500" : ""
                    }
                     >
                    <SelectValue
                      placeholder={!watchRm ? "Select RM first" : "Select EM"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingReportees && (
                      <div className="flex items-center justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    )}
                    {reportees.map((e) => (
                      <SelectItem key={e.id} value={String(e.id)}>
                        {e.first_name} {e.last_name}
                      </SelectItem>
                    ))}
                    {!isLoadingReportees && reportees.length === 0 && (
                      <div className="p-2 text-xs text-center text-zinc-500">
                        No reportees found
                      </div>
                    )}
                  </SelectContent>
                </Select>
                {errors.visit_assigned_to_em && (
                  <p className="text-xs text-red-500">
                    {errors.visit_assigned_to_em.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="visit_remarks">Remarks</Label>
              <textarea
                id="visit_remarks"
                placeholder="Any additional notes..."
                disabled={isLoading}
                {...register("visit_remarks")}
                className="flex w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 h-24 resize-none"
              />
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-end gap-3 rounded-b-xl shrink-0">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="schedule-visit-form"
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Schedule Visit
          </Button>
        </div>
      </div>
    </div>
  );
};
