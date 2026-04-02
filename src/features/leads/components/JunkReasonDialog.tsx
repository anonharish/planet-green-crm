import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { AlertCircle } from 'lucide-react';

interface JunkReasonDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading?: boolean;
  title?: string;
}

export const JunkReasonDialog: React.FC<JunkReasonDialogProps> = ({
  open,
  onClose,
  onConfirm,
  isLoading,
  title = "Reason for Marking as Junk",
}) => {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason.trim());
      setReason("");
    }
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[420px] bg-white dark:bg-zinc-950 p-0 overflow-hidden border-none rounded-3xl shadow-2xl">
        <div className="p-8 space-y-6">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle size={20} className="text-[#0f3d6b]" />
              <DialogTitle className="text-xl font-black text-[#0f3d6b] tracking-tight">{title}</DialogTitle>
            </div>
            <DialogDescription className="text-zinc-500 font-medium text-sm">
              Please provide a valid reason for marking this lead as junk.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <textarea 
              className="w-full h-24 bg-zinc-50/50 dark:bg-zinc-900 px-4 py-3 rounded-xl border border-zinc-100 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#0f3d6b]/10 focus:border-[#0f3d6b] transition-all resize-none text-zinc-600 dark:text-zinc-300 font-medium text-sm shadow-inner"
              placeholder="e.g., Wrong number, Not interested..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button 
              variant="ghost" 
              onClick={handleClose}
              className="px-6 font-bold text-zinc-500 hover:bg-zinc-50 transition-all text-xs"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={!reason.trim() || isLoading}
              className="px-8 bg-[#0f3d6b] hover:bg-[#0c3156] text-white rounded-xl font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 text-xs"
            >
              {isLoading ? "Updating..." : "Mark as Junk"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
