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
        {/* Header Section */}
        <DialogHeader className="p-5 bg-linear-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/5 dark:to-teal-500/5 border-b">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              {manager?.first_name[0]}{manager?.last_name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate">
                Direct Reports
              </DialogTitle>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                Managed by <span className="font-semibold text-emerald-600 dark:text-emerald-400">{manager?.first_name} {manager?.last_name}</span>
              </p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800 uppercase tracking-tight">
              {filteredReports.length} Reports
            </div>
          </div>
        </DialogHeader>

        {/* Search Bar Section */}
        <div className="px-5 py-3 border-b bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
            <Input 
              placeholder="Search reports by name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9 h-9 text-xs bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-lg focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500/50 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="h-3 w-3" />
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
            <div className="text-center py-16 px-6">
              <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-3 border border-zinc-100 dark:border-zinc-800">
                <UserIcon className="h-6 w-6 text-zinc-200 dark:text-zinc-800" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {searchQuery ? 'No results found' : 'No reports yet'}
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
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
        <div className="p-3 bg-zinc-50 dark:bg-zinc-900/10 border-t flex justify-end items-center px-5">
           <Button variant="outline" onClick={onClose} className="h-8 text-xs px-5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all font-bold">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
