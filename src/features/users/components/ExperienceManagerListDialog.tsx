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
import { Mail, Phone, User as UserIcon, Loader2, Search, X } from 'lucide-react';
import type { User } from '../types';

interface ExperienceManagerListDialogProps {
  open: boolean;
  onClose: () => void;
  manager: User | null;
}

export const ExperienceManagerListDialog = ({
  open,
  onClose,
  manager
}: ExperienceManagerListDialogProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch reportees for this manager (Dedicated API)
  const { data: reportees = [], isLoading, isFetching } = useGetReporteesQuery(
    { reporting_manager_id: manager?.id || 0, offset: 0 },
    { skip: !open || !manager?.id } // Only fetch when dialog opens and manager is present
  );

  // Apply local search query to the filtered results from API
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0 border-none shadow-2xl bg-white/95 backdrop-blur-md dark:bg-zinc-950/95">
        {/* Header Section - Emerald Theme */}
        <DialogHeader className="p-6 bg-[#f0f9f6] dark:bg-emerald-950/20 border-b border-emerald-100 dark:border-emerald-900/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#34d399] flex items-center justify-center text-white font-black text-sm shadow-sm">
              {manager?.first_name[0]}{manager?.last_name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-black text-[#0f3d6b] dark:text-zinc-100 truncate tracking-tight">
                Direct Reports
              </DialogTitle>
              <p className="text-xs text-zinc-500 font-bold dark:text-zinc-400 truncate">
                Managed by <span className="text-[#10b981]">{manager?.first_name} {manager?.last_name}</span>
              </p>
            </div>
            <div className="bg-white dark:bg-emerald-900/30 px-3 py-1 rounded-full text-[10px] font-black text-[#10b981] border border-[#d1fae5] dark:border-emerald-800 uppercase tracking-widest shadow-sm">
              {filteredReports.length} REPORTS
            </div>
          </div>
        </DialogHeader>

        {/* Search Bar Section - Pill Style */}
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#10b981] opacity-60" />
            <Input 
              placeholder="Search reports by name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-11 h-11 text-sm bg-white dark:bg-zinc-900 border-[#10b981]/30 dark:border-zinc-800 rounded-full focus-visible:ring-[#10b981]/10 focus-visible:border-[#10b981] transition-all shadow-sm font-medium"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-400"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* List Section */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {isLoading || isFetching ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-400">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
              <p className="text-[11px] font-medium animate-pulse tracking-wide uppercase">Updating results...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-20 px-10">
              <div className="w-20 h-20 bg-[#f0f9f6] dark:bg-emerald-900/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-50 dark:border-emerald-900/30">
                <UserIcon size={32} className="text-[#10b981] opacity-30" />
              </div>
              <h3 className="text-lg font-black text-[#0f3d6b] dark:text-zinc-100 tracking-tight">
                {searchQuery ? 'No results found' : 'No reports yet'}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 font-medium max-w-[200px] mx-auto leading-relaxed">
                {searchQuery 
                  ? `We couldn't find any reports matching "${searchQuery}"`
                  : 'This relationship manager has no experience managers assigned.'}
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredReports.map((agent: User) => (
                <div 
                  key={agent.id} 
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-emerald-50/50 dark:hover:bg-emerald-500/5 border border-transparent hover:border-emerald-500/10 transition-all duration-200 cursor-default group"
                >
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 dark:text-zinc-600 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-colors">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {agent.first_name} {agent.last_name}
                    </h4>
                    <div className="flex items-center gap-3 mt-0.5">
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                        <Mail className="h-2.5 w-2.5 opacity-70" />
                        <span className="truncate">{agent.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                        <Phone className="h-2.5 w-2.5 opacity-70" />
                        <span>{agent.phone_number}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Section */}
        <div className="p-5 bg-zinc-50 dark:bg-zinc-900/10 border-t border-zinc-100 dark:border-zinc-800 flex justify-end items-center px-6">
           <Button 
            onClick={onClose} 
            className="h-11 px-8 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[#0f3d6b] dark:text-zinc-300 font-black text-sm shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all active:scale-95"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
