import React from 'react';
import { Clock, Pencil, MapPin, User, ArrowRight } from 'lucide-react';
import type { LeadVisit } from '../../types';
import { ScheduleVisitDialog } from '../ScheduleVisitDialog';
import { useGetAllUsersByRoleIdQuery } from '@/features/users/api/usersApi';
import { useScheduleVisitMutation } from '@/features/leads/api/leadsApi';
import { useMasterDataLookup } from '../../../../shared/hooks/useMasterDataLookup';

interface LeadVisitsTabProps {
  visits?: LeadVisit[];
  lead: any;
  siteVisitStatuses: any[];
  getSiteVisitStatusLabel: (id: number) => string;
}

const formatVisitTime = (dateStr: string | null) => {
  if (!dateStr) return '--:-- --';
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  } catch {
    return '--:-- --';
  }
};

export const LeadVisitsTab = ({
  visits,
  lead,
  siteVisitStatuses,
  getSiteVisitStatusLabel
}: LeadVisitsTabProps) => {
  const [scheduleVisit, { isLoading: isScheduling }] = useScheduleVisitMutation();
  const { getRmLabel, getEmLabel, getProjectLabel } = useMasterDataLookup();

  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedVisit, setSelectedVisit] = React.useState<LeadVisit | null>(null);
  const { data: rms = [] } = useGetAllUsersByRoleIdQuery({
    role_id: 3,
    offset: 0,
  });

  return (
    <div className="mt-4 space-y-4">
      {!visits || visits.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] border border-zinc-100 rounded-2xl bg-white/50 backdrop-blur-sm mt-4">
          <p className="text-sm text-zinc-400 font-medium italic">No visit history scheduled for this lead.</p>
          <button
            onClick={() => setOpenDialog(true)}
            className="mt-4 text-sm text-indigo-600 hover:text-indigo-800 font-semibold"
          >
            + Schedule First Visit
          </button>
        </div>
      ) : (
        <>
          {/* HEADER */}
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              Scheduled Visits
            </h3>
            <button
              onClick={() => {
                setSelectedVisit(null);
                setOpenDialog(true);
              }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              + Schedule New
            </button>
          </div>

          <div className="space-y-4">
            {visits.map((v) => {
              const visitDate = v.visit_date_time ? new Date(v.visit_date_time) : new Date(v.created_on);
              const day = String(visitDate.getDate()).padStart(2, '0');
              const month = visitDate.toLocaleString('default', { month: 'short' }).toUpperCase();
              const projectName = getProjectLabel(lead.project_id);

              return (
                <div
                  key={v.id}
                  className="group flex items-center justify-between p-5 rounded-[24px] bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-all"
                >
                  <div className="flex gap-6 items-center">
                    {/* DATE BADGE */}
                    <div className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shrink-0">
                      <span className="text-[10px] font-bold text-red-500 tracking-tighter mb-0.5">{month}</span>
                      <span className="text-xl font-black text-zinc-900 dark:text-zinc-100 leading-none">{day}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-wider">
                          {getSiteVisitStatusLabel(v.visit_status)}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-zinc-500 font-medium">
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-zinc-400" />
                          {formatVisitTime(v.visit_date_time)}
                        </span>
                        
                        {v.visit_assigned_to_em && (
                          <span className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-zinc-400" />
                            EM: {getEmLabel(v.visit_assigned_to_em)}
                          </span>
                        )}

                        {!v.visit_assigned_to_em && v.visit_assigned_to_rm && (
                          <span className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-zinc-400" />
                            RM: {getRmLabel(v.visit_assigned_to_rm)}
                          </span>
                        )}
                      </div>

                      {v.visit_location_url && (
                        <a
                          href={v.visit_location_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-bold hover:underline group/link"
                        >
                          <MapPin className="h-3.5 w-3.5" />
                          View on Google Maps
                          <ArrowRight className="h-3 w-3 translate-x-0 group-hover/link:translate-x-1 transition-transform" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <ScheduleVisitDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setSelectedVisit(null);
        }}
        lead={lead}
        siteVisitStatuses={siteVisitStatuses}
        rms={rms}
        onSubmit={async (data) => {
          try {
            await scheduleVisit({
              lead_uuid: lead.uuid,
              visit_location_url: data.visit_location_url,
              visit_date_time: data.visit_date_time,
              visit_remarks: data.visit_remarks,
              visit_status: data.visit_status,
              visit_assigned_to_rm: data.visit_assigned_to_rm,
              visit_assigned_to_em: data.visit_assigned_to_em,
            }).unwrap();
            setOpenDialog(false);
            setSelectedVisit(null);
          } catch (err) {
            console.error("Schedule Visit Error:", err);
          }
        }}
        isLoading={isScheduling}
      />
    </div>
  );
};