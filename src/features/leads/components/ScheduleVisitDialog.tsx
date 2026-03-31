import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, CalendarIcon } from "lucide-react";
import { format } from "date-fns";

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

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";
import { Calendar } from "../../../components/ui/calendar";

import type { Lead, ScheduleVisitRequest } from "../types";

/* -------------------- SCHEMA -------------------- */
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

  /* ✅ KEEP THIS FUNCTION */
  const convertTo12Hour = (dateTime: string) => {
    if (!dateTime) return "";

    const date = new Date(dateTime);
    let hours = date.getHours();
    const minutes = date.getMinutes();

    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    return `${hours}:${String(minutes).padStart(2, "0")} ${period}`;
  };

  /* -------------------- DATE STATE -------------------- */
  const [date, setDate] = useState<Date | undefined>();
  const [hour, setHour] = useState("10");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState<"AM" | "PM">("AM");

  const watchStatus = watch("visit_status");
  const watchRm = watch("visit_assigned_to_rm");
  const watchEm = watch("visit_assigned_to_em");

  const { data: reportees = [], isLoading: isLoadingReportees } =
    useGetReporteesQuery(
      { reporting_manager_id: watchRm as number, offset: 0 },
      { skip: !watchRm },
    );

  useEffect(() => {
    if (watchRm && watchEm) {
      const emExists = reportees.some((r) => r.id === watchEm);
      if (!isLoadingReportees && reportees.length > 0 && !emExists) {
        setValue("visit_assigned_to_em", undefined as any);
      }
    }
  }, [watchRm, reportees, isLoadingReportees, watchEm, setValue]);

  useEffect(() => {
    if (open && lead) {
      reset({
        visit_date_time: "",
        visit_location_url: "",
        visit_status: undefined,
        visit_assigned_to_rm: isRM
          ? Number(currentUser?.id)
          : lead.assigned_to_rm || undefined,
        visit_assigned_to_em: lead.assigned_to_em || undefined,
        visit_remarks: "",
      });
    }
  }, [open, lead, reset, isRM, currentUser]);

  if (!open || !lead) return null;

  /* -------------------- SUBMIT -------------------- */
  const handleFormSubmit = async (data: ScheduleVisitFormValues) => {
    if (!date) return;

    let hrs = parseInt(hour);

    if (period === "PM" && hrs !== 12) hrs += 12;
    if (period === "AM" && hrs === 12) hrs = 0;

    const formattedDate = `${format(date, "yyyy-MM-dd")} ${String(
      hrs,
    ).padStart(2, "0")}:${minute}:00`;

    await onSubmit({
      ...data,
      visit_date_time: formattedDate,
      lead_uuid: lead.uuid,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-950 w-full max-w-lg rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[75vh]">
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b bg-zinc-50/50">
          <h2 className="text-lg font-bold">Schedule Visit</h2>
          <p className="text-sm text-zinc-500">
            Schedule a site visit for {lead.first_name} {lead.last_name}
          </p>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto">
          <form
            id="schedule-visit-form"
            onSubmit={handleSubmit(handleFormSubmit)}
            className="space-y-4"
          >
            {/* ✅ DATE TIME */}
            <div className="space-y-2">
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

            {/* ✅ LOCATION URL */}
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

            {/* ✅ STATUS */}
            <div className="space-y-2">
              <Label>Visit Status *</Label>
              <Select
                value={watchStatus?.toString() || ""}
                onValueChange={(val) => setValue("visit_status", Number(val))}
                disabled={isLoading}
              >
                <SelectTrigger
                  className={errors.visit_status ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {siteVisitStatuses.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.visit_status && (
                <p className="text-xs text-red-500">
                  {errors.visit_status.message}
                </p>
              )}
            </div>

            {/* ✅ RM + EM */}
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
                    <SelectTrigger>
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
                  <SelectTrigger>
                    <SelectValue placeholder="Select EM" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportees.map((e) => (
                      <SelectItem key={e.id} value={String(e.id)}>
                        {e.first_name} {e.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* ✅ REMARKS */}
            <div className="space-y-2">
              <Label>Remarks</Label>
              <textarea
                {...register("visit_remarks")}
                className="w-full border rounded p-2 h-24"
              />
            </div>
          </form>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="schedule-visit-form">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Schedule Visit
          </Button>
        </div>
      </div>
    </div>
  );
};