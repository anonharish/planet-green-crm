import React, { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
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

  const handleFormSubmit = async (data: ScheduleVisitFormValues) => {
    // Convert to MySQL DATETIME format (YYYY-MM-DD HH:MM:SS)
    // e.g. "2026-03-27T17:10" -> "2026-03-27 17:10:00"
    const formattedDate = `${data.visit_date_time.replace("T", " ")}:00`;

    await onSubmit({
      ...data,
      visit_date_time: formattedDate,
      lead_uuid: lead.uuid,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-950 w-full max-w-lg rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[75vh]">
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Schedule Visit
          </h2>
          <p className="text-sm text-zinc-500">
            Schedule a site visit for {lead.first_name} {lead.last_name}
          </p>
        </div>

        <div className="p-6 overflow-y-auto min-h-0">
          <form
            id="schedule-visit-form"
            onSubmit={handleSubmit(handleFormSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="visit_date_time">Visit Date & Time *</Label>
              <Input
                id="visit_date_time"
                type="datetime-local"
                disabled={isLoading}
                {...register("visit_date_time")}
                className={errors.visit_date_time ? "border-red-500" : ""}
              />
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
