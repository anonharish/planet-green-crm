import React from 'react';
import type { JunkLead } from '../data/junkLeadsData';
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

interface ReassignRMModalProps {
  open: boolean;
  onClose: () => void;
  lead: JunkLead | null;
  onConfirm: (rmId: string, reason: string) => void;
}

export const ReassignRMModal: React.FC<ReassignRMModalProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  const [rmId, setRmId] = React.useState<string>("");
  const [reason, setReason] = React.useState<string>("");

  const handleConfirm = () => {
    if (rmId && reason) {
      onConfirm(rmId, reason);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-zinc-950 p-0 overflow-hidden border-none rounded-[2.5rem] shadow-2xl">
        <div className="p-10 space-y-8">
          <DialogHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-3xl font-black text-[#0f3d6b] tracking-tight">Reassign Relationship Manager</DialogTitle>
              {/* <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <X size={20} className="text-zinc-400" />
              </Button> */}
            </div>
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
                <SelectContent className="rounded-2xl border-zinc-100 dark:border-zinc-800 shadow-xl">
                  <SelectItem value="1" className="py-3 font-bold">Vikas Khanna</SelectItem>
                  <SelectItem value="2" className="py-3 font-bold">Kiran Rao</SelectItem>
                  <SelectItem value="3" className="py-3 font-bold">Sanjay Dutt</SelectItem>
                  <SelectItem value="4" className="py-3 font-bold">Anita Desai</SelectItem>
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
              className="py-8 bg-white dark:bg-zinc-950 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl font-black text-zinc-500 hover:bg-zinc-50 transition-all"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={!rmId || !reason}
              className="py-8 bg-[#0f3d6b] hover:bg-[#0c3156] text-white rounded-2xl font-black shadow-lg shadow-indigo-900/10 transition-all hover:translate-y-[-2px] active:translate-y-0 disabled:opacity-50 disabled:translate-y-0"
            >
              Confirm Reassignment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
