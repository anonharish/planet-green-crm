import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { useGetReporteesQuery } from '../api/usersApi';
import { Search, X, Calendar, AlertTriangle, Loader2, User as UserIcon } from 'lucide-react';
import type { User } from '../types';
import { cn } from '../../../utils';

interface ExperienceManagerListDialogProps {
  open: boolean;
  onClose: () => void;
  manager: User | null;
  visitLocation?: string;
  onConfirm?: (agentId: number) => void;
}

export const ExperienceManagerListDialog = ({
  open,
  onClose,
  manager,
  visitLocation = "Prestige High Fields", // Default/Placeholder as per Figma
  onConfirm
}: ExperienceManagerListDialogProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  // const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);

  // Fetch reportees for this manager
  const { data: reportees = [], isLoading, isFetching } = useGetReporteesQuery(
    { reporting_manager_id: manager?.id || 0, offset: 0 },
    { skip: !open || !manager?.id }
  );

  const filteredReports = useMemo(() => {
    if (!searchQuery) return reportees;
    const lowerQuery = searchQuery.toLowerCase();
    return reportees.filter(agent => 
      agent.first_name.toLowerCase().includes(lowerQuery) ||
      agent.last_name.toLowerCase().includes(lowerQuery) ||
      agent.email.toLowerCase().includes(lowerQuery) ||
      agent.phone_number.includes(searchQuery)
    );
  }, [reportees, searchQuery]);

  // Mock colors for avatars as seen in Figma
  const getAvatarColor = (id: number) => {
    const colors = [
      'bg-[#0f3d6b]', // Dark Navy
      'bg-[#7dd3fc]', // Light Blue
      'bg-[#064e3b]', // Dark Green
      'bg-[#f9a8d4]', // Pinkish
    ];
    return colors[id % colors.length];
  };

  // const handleConfirm = () => {
  //   if (selectedAgentId && onConfirm) {
  //     onConfirm(selectedAgentId);
  //   }
  //   // For now, if no onConfirm is passed (like in UserTable), we just close or handle it
  //   if (!onConfirm) onClose();
  // };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[672px] h-[691px] max-w-[672px] overflow-hidden flex flex-col p-0 gap-0 border border-zinc-100 shadow-2xl bg-white dark:bg-zinc-950 rounded-[24px]">
        {/* Header Section */}
        <div className="p-8 pb-4 relative">
          <button 
            onClick={onClose}
            className="absolute right-8 top-8 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-400"
          >
           
          </button>
          
          <DialogHeader className="text-left space-y-1">
            <DialogTitle className="text-2xl font-bold text-[#0f3d6b] dark:text-zinc-100 tracking-tight">
              Assign Experience Manager
            </DialogTitle>
            <p className="text-sm text-[#0f3d6b]/70 font-medium">
              Selection for site visit at <span className="text-[#0f3d6b] border-b border-[#0f3d6b]/30">{visitLocation}</span>
            </p>
          </DialogHeader>
        </div>

        {/* Search Bar */}
        <div className="px-8 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
            <Input 
              placeholder="Search experience managers..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base bg-zinc-50 dark:bg-zinc-900 border-none rounded-xl focus-visible:ring-1 focus-visible:ring-zinc-200 transition-all shadow-none"
            />
          </div>
        </div>

        {/* Manager List */}
        <div className="flex-1 overflow-y-auto px-8 pb-4 custom-scrollbar">
          {isLoading || isFetching ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-400">
              <Loader2 className="h-8 w-8 animate-spin text-[#0f3d6b]" />
              <p className="text-sm font-medium tracking-wide">Loading managers...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-10">
               <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserIcon size={24} className="text-zinc-300" />
              </div>
              <p className="text-zinc-500 font-medium">No experience managers found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReports.map((agent: User) => {
                const initials = `${agent.first_name[0]}${agent.last_name[0]}`;
                // const isSelected = selectedAgentId === agent.id;
                
                // MOCK Metrics (as seen in Figma)
                const mockVisits = (agent.id % 5) + 1;
                const isAtCapacity = agent.id % 4 === 0;

                return (
                  <div 
                    key={agent.id} 
                    // onClick={() => setSelectedAgentId(agent.id)}
                    className={cn(
                    "flex items-center gap-4 p-4 rounded-3xl border transition-all duration-200 cursor-default",
                    "bg-white border-zinc-100 hover:border-zinc-200"
                  )}
                  >
                    <div className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0",
                      getAvatarColor(agent.id)
                    )}>
                      {initials}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {agent.first_name} {agent.last_name}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        <div className={cn(
                          "flex items-center gap-1.5 text-sm font-semibold",
                          isAtCapacity ? "text-red-500" : "text-zinc-500"
                        )}>
                          {isAtCapacity ? <AlertTriangle className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
                          <span>{mockVisits} {isAtCapacity ? `visits (At Capacity)` : `visits scheduled`}</span>
                        </div>
                        <span className="text-zinc-300">•</span>
                        <span className="text-sm text-zinc-500 font-medium truncate">
                           Prestige Group
                        </span>
                      </div>
                    </div>

                    {/* <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                      isSelected 
                        ? "border-[#0f3d6b] bg-[#0f3d6b]" 
                        : "border-zinc-200 bg-white"
                    )}>
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                    </div> */}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer
        <div className="p-8 pt-4 flex justify-center bg-white dark:bg-zinc-950">
          <Button 
            onClick={handleConfirm}
            disabled={!selectedAgentId}
            className="w-full max-w-sm h-14 rounded-2xl bg-[#0f3d6b] hover:bg-[#0f3d6b]/90 text-white font-bold text-lg shadow-xl shadow-[#0f3d6b]/20 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            Confirm Assignment
          </Button>
        </div> */}
      </DialogContent>
    </Dialog>
  );
};
