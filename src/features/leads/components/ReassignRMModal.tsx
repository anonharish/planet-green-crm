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
import { X } from 'lucide-react';

interface ReassignRMModalProps {
  open: boolean;
  onClose: () => void;
  lead: Lead | null;
  rms: any[];
  onConfirm: (rmId: number, reason: string) => void;
  initialReason?: string;
}

export const ReassignRMModal: React.FC<ReassignRMModalProps> = ({
  open,
  onClose,
  rms,
  onConfirm,
  initialReason = "",
}) => {
  const [rmId, setRmId] = React.useState<string>("");
  const [reason, setReason] = React.useState<string>(initialReason);

  // Sync reason if initialReason changes when modal opens
  React.useEffect(() => {
    if (open) {
      setReason(initialReason);
    }
  }, [open, initialReason]);

  const handleConfirm = () => {
    if (rmId && reason) {
      onConfirm(Number(rmId), reason);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-950 p-0 border-none rounded-[2.5rem] shadow-2xl scrollbar-hide">
        <div className="p-8 space-y-6 relative">

          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="text-2xl font-black text-[#0f3d6b] tracking-tight pr-8">
              Reassign Relationship Manager
            </DialogTitle>
            <DialogDescription className="text-zinc-500 font-medium text-sm">
              Select a new RM and provide a reason for reassignment.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2.5">
              <label className="text-[10px] font-black text-[#0f3d6b] uppercase tracking-widest pl-1">
                Select New Relationship Manager
              </label>
              <Select value={rmId} onValueChange={setRmId}>
                <SelectTrigger className="w-full h-14 bg-zinc-50/50 dark:bg-zinc-900 border-none px-6 rounded-2xl text-zinc-700 font-bold focus:ring-0 shadow-inner">
                  <SelectValue placeholder="Choose an RM..." />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-zinc-100 dark:border-zinc-800 shadow-xl max-h-60 overflow-y-auto bg-white text-black">
                  {(rms || []).map((rm) => (
                    <SelectItem key={rm.id} value={String(rm.id)} className="py-3 font-bold cursor-pointer text-black">
                      <div className="flex items-center gap-2">
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

            <div className="space-y-2.5">
              <label className="text-[10px] font-black text-[#0f3d6b] uppercase tracking-widest pl-1">
                Reason for Reassignment
              </label>
              <textarea 
                className="w-full h-32 bg-zinc-50/50 dark:bg-zinc-900 px-6 py-5 rounded-2xl border-none focus:outline-none focus:ring-0 transition-all resize-none text-zinc-500 dark:text-zinc-400 font-bold text-sm leading-relaxed shadow-inner placeholder:text-zinc-300"
                placeholder="e.g., Lead is actually a valid inquiry for The Crest Towers. Please follow up."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-3 pt-2">
            <div className="col-span-4">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="w-full h-[52px] text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl font-bold text-zinc-500 hover:bg-zinc-50 transition-all"
              >
                Cancel
              </Button>
            </div>
            <div className="col-span-8">
              <Button 
                onClick={handleConfirm}
                disabled={!rmId || !reason}
                className="w-full h-[52px] text-sm bg-[#0f3d6b] hover:bg-[#1e293b] text-white rounded-2xl font-black shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
              >
                Confirm Reassignment
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
