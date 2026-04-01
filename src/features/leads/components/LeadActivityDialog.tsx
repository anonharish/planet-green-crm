import React, { useState } from "react";
import { Loader2, X } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import type { Lead, AddLeadActivityRequest } from "../types";

interface LeadActivityDialogProps {
  open: boolean;
  onClose: () => void;
  lead: Lead | null;
  onSubmit: (data: AddLeadActivityRequest) => Promise<void>;
  isLoading: boolean;
}

export const LeadActivityDialog = ({
  open,
  onClose,
  lead,
  onSubmit,
  isLoading,
}: LeadActivityDialogProps) => {
  const [remark, setRemark] = useState("");

  if (!open || !lead) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remark.trim()) return;

    await onSubmit({
      lead_uuid: lead.uuid,
      remark: remark,
      activity_type: "REMARK_ADDED",
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-950 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-zinc-200 dark:border-zinc-800">
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Add Lead Activity
            </h2>
            <p className="text-sm text-zinc-500 mt-1">
              Record a new activity for {lead.first_name} {lead.last_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-zinc-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="activity_remark" className="text-sm font-semibold">
              Activity Remark
            </Label>
            <textarea
              id="activity_remark"
              placeholder="Type lead activity here..."
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              disabled={isLoading}
              required
              className="flex w-full rounded-xl border border-zinc-200 bg-zinc-50/50 dark:bg-zinc-900/50 px-4 py-3 text-sm shadow-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 h-40 resize-none transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
              className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !remark.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 px-8 py-2 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-70"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};