import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useGetVisitsByUserIdQuery } from '../../leads/api/leadsApi';
import { useGetAllMasterDataQuery } from '../../master/api/masterApi';
import { format } from 'date-fns';
import { CalendarIcon, ListFilter, Plus, Search, MapPin, Clock } from 'lucide-react';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { Calendar } from '../../../components/ui/calendar';
import { ScheduleVisitDialog } from '../../leads/components/ScheduleVisitDialog';
import { useGetAllUsersByRoleIdQuery } from '../../users/api/usersApi';
import { cn } from '../../../utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

export const ScheduledVisitsPage = () => {
  const { userId: paramUserId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role_id === 1 || user?.role_id === 2;
  
  const userId = paramUserId ? parseInt(paramUserId, 10) : user?.id;

  const [date, setDate] = useState<Date>(new Date());
  const [filterStartDate, setFilterStartDate] = useState<Date | undefined>(new Date());
  const [filterEndDate, setFilterEndDate] = useState<Date | undefined>(new Date());
  const [draftStartDate, setDraftStartDate] = useState<Date | undefined>(new Date());
  const [draftEndDate, setDraftEndDate] = useState<Date | undefined>(new Date());

  // Fetch Master Data and Users first
  const { data: masterData } = useGetAllMasterDataQuery();
  const { data: rms = [] } = useGetAllUsersByRoleIdQuery({ role_id: 3, offset: 0 });
  const { data: ems = [] } = useGetAllUsersByRoleIdQuery({ role_id: 4, offset: 0 });
  const siteVisitStatuses = masterData?.site_visit_status || [];
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'SCHDLD' | 'COMPLETED'>('SCHDLD');
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [selectedEmId, setSelectedEmId] = useState<string | undefined>(userId?.toString());

  // Update selectedEmId when userId changes (e.g. on mount or param change)
  React.useEffect(() => {
    if (userId) {
      setSelectedEmId(userId.toString());
    }
  }, [userId]);

  // Default to first user in ems list if current selection is not valid or empty
  React.useEffect(() => {
    if (isAdmin && ems.length > 0 && (!selectedEmId || !ems.find((e: any) => e.id.toString() === selectedEmId))) {
      setSelectedEmId(ems[0].id.toString());
    }
  }, [ems, selectedEmId, isAdmin]);

  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const scheduledStatus = masterData?.site_visit_status?.find((s: any) => s.code === 'SCHDLD');
  const scheduledStatusId = scheduledStatus?.id;

  const completedStatus = masterData?.site_visit_status?.find((s: any) => s.code === 'CMPLTD');
  const completedStatusId = completedStatus?.id;

  const activeStatusId = activeTab === 'SCHDLD' ? scheduledStatusId : completedStatusId;

  // Fetch Visits
  const isTodayFilter = filterStartDate && filterEndDate &&
    filterStartDate.toDateString() === new Date().toDateString() &&
    filterEndDate.toDateString() === new Date().toDateString();

  const { data: visitsData, isLoading } = useGetVisitsByUserIdQuery(
    {
      user_id: selectedEmId ? parseInt(selectedEmId, 10) : (userId as number),
      offset: 0,
      date: activeTab === 'SCHDLD'
        ? format(date, 'yyyy-MM-dd')
        : (isTodayFilter ? format(new Date(), 'yyyy-MM-dd') : undefined),
      start_date: activeTab === 'COMPLETED' && !isTodayFilter && filterStartDate ? format(filterStartDate, 'yyyy-MM-dd') : undefined,
      end_date: activeTab === 'COMPLETED' && !isTodayFilter && filterEndDate ? format(filterEndDate, 'yyyy-MM-dd') : undefined,
      visit_status: activeStatusId
    },
    { skip: (!selectedEmId && !userId) || !activeStatusId }
  );

  const visits = visitsData || [];

  // Local Search Filter
  const filteredVisits = useMemo(() => {
    if (!searchTerm) return visits;
    return visits.filter((v: any) => {
      const name = `${v.c_first_name || ''} ${v.c_last_name || ''}`.toLowerCase();
      const location = (v.visit_location_url || '').toLowerCase();
      return name.includes(searchTerm.toLowerCase()) || location.includes(searchTerm.toLowerCase());
    });
  }, [visits, searchTerm]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab, date]);

  const totalPages = Math.max(1, Math.ceil(filteredVisits.length / ITEMS_PER_PAGE));
  const paginatedVisits = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredVisits.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredVisits, currentPage]);

  console.log(ems, "insideems");
  return (
    <div className="flex flex-col h-full bg-transparent pt-8 pb-20 px-4 space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-primary tracking-tight">
          Scheduled Site Visits
        </h1>
        <div className="flex items-center gap-4">
          {activeTab === 'COMPLETED' && (
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-11 rounded-[16px] px-6 border-search-border dark:border-zinc-800 text-base font-bold text-primary bg-white shadow-sm">
                  <ListFilter className="mr-2 h-4 w-4 text-primary" />
                  Filter
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="end">
                <div className="flex flex-col space-y-4">
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Filter Completed Visits</h4>
                  <div className="space-y-3">
                    <div className="flex flex-col space-y-1.5">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">From Date</label>
                      <Input
                        type="date"
                        max={format(new Date(), 'yyyy-MM-dd')}
                        value={draftStartDate ? format(draftStartDate, 'yyyy-MM-dd') : ''}
                        onChange={(e) => setDraftStartDate(e.target.value ? new Date(e.target.value) : undefined)}
                        className="w-full"
                      />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">To Date</label>
                      <Input
                        type="date"
                        max={format(new Date(), 'yyyy-MM-dd')}
                        value={draftEndDate ? format(draftEndDate, 'yyyy-MM-dd') : ''}
                        onChange={(e) => setDraftEndDate(e.target.value ? new Date(e.target.value) : undefined)}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 pt-2">
                    <Button
                      className="w-full font-bold bg-[#0f3d6b] hover:bg-[#0c3156] text-white"
                      onClick={() => {
                        setFilterStartDate(draftStartDate);
                        setFilterEndDate(draftEndDate);
                        setIsFilterOpen(false);
                      }}
                    >
                      Apply Filter
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full font-bold"
                      onClick={() => {
                        setDraftStartDate(new Date());
                        setDraftEndDate(new Date());
                        setFilterStartDate(new Date());
                        setFilterEndDate(new Date());
                      }}
                    >
                      Reset to Today
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* EM Selection Dropdown */}
          {isAdmin && (
            <div className="flex items-center gap-2 min-w-[200px]">
              <Select value={selectedEmId} onValueChange={setSelectedEmId}>
                <SelectTrigger className="h-11 rounded-[16px] px-4 border-search-border bg-white shadow-sm font-bold text-primary">
                  <SelectValue placeholder="Select Experience Manager" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-zinc-200 bg-white text-black">
                  {ems.map((em: any) => (
                    <SelectItem key={em.id} value={em.id.toString()} className="font-medium text-black cursor-pointer">
                      {em.first_name} {em.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* 60/40 Search and Tabs Section */}
      <div className="flex items-center gap-4">
        {/* Search Input (60%) */}
        <div className="w-[60%] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
          <Input
            placeholder="Search leads....."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 h-12 rounded-full bg-white dark:bg-zinc-900 border-search-border shadow-sm focus-visible:ring-primary/10 text-base placeholder:text-zinc-400"
          />
        </div>

        {/* Tabs (40%) */}
        <div className="w-[40%] bg-tab-rail dark:bg-zinc-900 rounded-xl h-[52px] p-1 flex shadow-inner">
          <button
            onClick={() => setActiveTab('SCHDLD')}
            className={cn(
              "flex-1 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
              activeTab === 'SCHDLD'
                ? "bg-white dark:bg-zinc-800 text-[#0f3d6b] dark:text-white shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
                : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            Scheduled Visits
            {activeTab === 'SCHDLD' && (
              <span className="bg-[#0f3d6b]/10 text-[#0f3d6b] px-2 py-0.5 rounded-full text-xs">
                {filteredVisits.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('COMPLETED')}
            className={cn(
              "flex-1 rounded-xl text-sm font-bold transition-all",
              activeTab === 'COMPLETED'
                ? "bg-white dark:bg-zinc-800 text-[#0f3d6b] dark:text-white shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
                : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Date Filter & Results */}
      <div className="pt-2">
        <div className="flex items-center w-full pb-2 mb-4">
          {activeTab === 'SCHDLD' ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="hover:bg-transparent px-0 h-auto font-bold text-lg text-zinc-900 dark:text-zinc-100 justify-start rounded-none">
                  {date.toDateString() === new Date().toDateString() ? 'Today, ' : ''}
                  {format(date, 'do MMMM')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-2xl" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          ) : (
            <div className="font-bold text-lg text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              {filterStartDate && filterEndDate
                ? `${format(filterStartDate, 'do MMM, yyyy')} - ${format(filterEndDate, 'do MMM, yyyy')}`
                : 'All Completed Visits'}
              <span className="text-sm font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full ml-2">
                {visits.length} results
              </span>
            </div>
          )}
          <div className="ml-6 flex-1 h-px bg-zinc-100 dark:bg-zinc-800"></div>
        </div>

        {/* Visits List */}
        <div className="mt-8 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center p-12 text-zinc-500">Loading scheduled visits...</div>
          ) : filteredVisits.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm mb-4">
              <CalendarIcon className="h-12 w-12 text-zinc-300 mb-4" />
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">No visits found</h3>
              <p className="text-zinc-500 text-sm mt-1">There are no visits scheduled for this date.</p>
            </div>
          ) : (
            paginatedVisits.map((visit: any, index: number) => {
              const bgColors = ['bg-blue-400', 'bg-indigo-300', 'bg-emerald-300', 'bg-amber-300', 'bg-purple-400'];
              const bgColor = bgColors[index % bgColors.length];
              const firstName = visit.c_first_name || '';
              const lastName = visit.c_last_name || '';
              const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'NA';

              return (
                <div key={visit.id || index} className="flex items-center gap-6 p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm hover:shadow-md transition-all">
                  <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center font-black text-xl text-[#0f3d6b] shrink-0 shadow-sm", bgColor)}>
                    {initials}
                  </div>
                  <div className="flex flex-col flex-1">
                    <h3 className="text-lg font-bold text-[#0f3d6b] dark:text-zinc-100 leading-tight">
                      {firstName} {lastName}
                    </h3>
                    <div className="flex items-center gap-4 mt-1.5 text-sm text-zinc-500 font-medium">
                      <span>{visit.lead_id || `LEAD-${visit.id}`}</span>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-zinc-400" />
                        <span>{visit.visit_date_time ? format(new Date(visit.visit_date_time), 'hh:mm a') : 'TBD'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 line-clamp-1 max-w-sm">
                        <MapPin className="h-4 w-4 text-zinc-400" />
                        <span>{visit.visit_location_url || 'No location provided'}</span>
                      </div>
                    </div>
                  </div>

                  {activeTab === 'COMPLETED' && (
                    <Button
                      className="ml-auto bg-[#0f3d6b] hover:bg-[#0c3156] text-white rounded-full px-6 font-bold"
                      onClick={() => navigate(`/visit-feedback/completed/${visit.id || visit.uuid}`, { state: { visit } })}
                    >
                      View Details
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Footer */}
        {filteredVisits.length > 0 && (
          <div className="mt-8 bg-white dark:bg-zinc-900 rounded-xl px-6 py-4 flex items-center justify-between shadow-sm">
            <div className="text-sm text-zinc-500 font-medium">
              Showing <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredVisits.length)}
              </span> of <span className="font-bold text-zinc-800 dark:text-zinc-200">{filteredVisits.length}</span> Site Visits
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5 text-sm font-bold">
                <Button
                  variant="ghost"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="text-zinc-500 flex items-center hover:bg-zinc-100 dark:hover:bg-zinc-800 px-3 h-9 disabled:opacity-50"
                >
                  <span className="mr-1">&lt;</span> Previous
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "ghost"}
                    onClick={() => setCurrentPage(pageNum)}
                    className={cn(
                      "h-9 w-9 p-0 rounded-xl transition-all",
                      currentPage === pageNum
                        ? "bg-[#0f3d6b] text-white hover:bg-[#0c3156]"
                        : "text-zinc-500 hover:bg-zinc-100"
                    )}
                  >
                    {pageNum}
                  </Button>
                ))}

                <Button
                  variant="ghost"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="text-zinc-900 border border-zinc-200 shadow-sm flex items-center hover:bg-zinc-50 dark:hover:bg-zinc-800 px-3 h-9 ml-2 disabled:opacity-50"
                >
                  Next <span className="ml-1">&gt;</span>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Needs refactor of ScheduleVisitDialog to support no-lead context */}
      {isScheduleOpen && (
        <ScheduleVisitDialog
          open={isScheduleOpen}
          onClose={() => setIsScheduleOpen(false)}
          lead={null as any}
          siteVisitStatuses={siteVisitStatuses}
          rms={rms}
          onSubmit={async () => { }}
          isLoading={false}
        />
      )}
    </div>
  );
};
