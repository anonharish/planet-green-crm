import React from 'react';
import type { Lead } from '../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { InitialsAvatar } from '../pages/JunkLeadsPage';

interface ReassignRMModalProps {
  open: boolean;
  onClose: () => void;
  lead: Lead | null;
  rms: any[];
  onConfirm: (rmId: number, reason: string) => void;
}

export const ReassignRMModal: React.FC<ReassignRMModalProps> = ({
  open,
  onClose,
  rms,
  onConfirm,
}) => {
  const [rmId, setRmId] = React.useState<string>("");
  const [reason, setReason] = React.useState<string>("");

  const handleConfirm = () => {
    if (rmId && reason) {
      onConfirm(Number(rmId), reason);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-zinc-950 p-0 overflow-hidden border-none rounded-4xl shadow-2xl">
        <div className="p-10 space-y-8">
          <DialogHeader className="space-y-4">
            <DialogTitle className="text-3xl font-black text-[#0f3d6b] tracking-tight">Reassign Relationship Manager</DialogTitle>
            <DialogDescription className="text-zinc-500 font-medium text-base">
              Select a new RM and provide a reason for reassignment.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-widest pl-1">Select New Relationship Manager</label>
              <Select value={rmId} onValueChange={setRmId}>
                <SelectTrigger className="w-full h-16 bg-zinc-50/50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 px-6 rounded-2xl text-zinc-700 font-bold focus:ring-4 focus:ring-indigo-500/10 shadow-inner">
                  <SelectValue placeholder="Choose an RM..." />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-zinc-100 dark:border-zinc-800 shadow-xl max-h-60 overflow-y-auto">
                  {rms.map((rm) => (
                    <SelectItem key={rm.id} value={String(rm.id)} className="py-3 font-bold cursor-pointer">
                      <div className="flex items-center gap-2">
                        {/* Note: InitialsAvatar is usually defined in LeadsPage or a shared component. 
                            Assuming I can use it if exported, or just render initials here. */}
                        <div className="h-6 w-6 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 flex items-center justify-center font-bold shrink-0 text-[10px]">
                          {rm.first_name[0]}{rm.last_name[0]}
                        </div>
                        {rm.first_name} {rm.last_name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-widest pl-1">Reason for Reassignment</label>
              <textarea 
                className="w-full h-32 bg-zinc-50/50 dark:bg-zinc-900 px-6 py-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 dark:focus:ring-indigo-500/5 transition-all resize-none text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed shadow-inner"
                placeholder="e.g., Lead is actually a valid inquiry for The Crest Towers. Please follow up."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="py-8 bg-white dark:bg-zinc-950 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl font-black text-zinc-500 hover:bg-zinc-50 transition-all font-bold"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={!rmId || !reason}
              className="py-8 bg-[#0f3d6b] hover:bg-[#0c3156] text-white rounded-2xl font-bold shadow-lg shadow-indigo-900/10 transition-all hover:translate-y-[-2px] active:translate-y-0 disabled:opacity-50 disabled:translate-y-0"
            >
              Confirm Reassignment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
