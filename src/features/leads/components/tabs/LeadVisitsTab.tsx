import React from 'react';
import { formatDate } from '../../../../utils';
import { Clock, Pencil } from 'lucide-react';
import type { LeadVisit } from '../../types';
import { ScheduleVisitDialog } from '../ScheduleVisitDialog';
import { useGetAllUsersByRoleIdQuery } from '@/features/users/api/usersApi';
import { useScheduleVisitMutation } from '@/features/leads/api/leadsApi';

interface LeadVisitsTabProps {
  visits?: LeadVisit[];
  lead: any;
  siteVisitStatuses: any[];
  rms?: { id: number; first_name: string; last_name: string }[];
  getSiteVisitStatusLabel: (id: number) => string;
}

export const LeadVisitsTab = ({
  visits,
  lead,
  siteVisitStatuses,
  // rms,
  getSiteVisitStatusLabel
}: LeadVisitsTabProps) => {
  const [scheduleVisit, { isLoading }] = useScheduleVisitMutation();

  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedVisit, setSelectedVisit] = React.useState<LeadVisit | null>(null);
  const { data: rms = [] } = useGetAllUsersByRoleIdQuery({
      role_id: 3,
      offset: 0,
    });

  // ✅ Helper to get RM name from rms array
  const getRmName = (rmId: number) => {
    const rm = rms.find(r => r.id === rmId);
    return rm ? `${rm.first_name} ${rm.last_name}` : '--';
  };

  if (!visits || visits.length === 0) {
    return (
      <div className="p-8 text-center text-zinc-500 border border-zinc-200 dark:border-zinc-800 rounded-xl mt-4 bg-white dark:bg-zinc-950">
        No visit history scheduled.
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          Scheduled Visits
        </h3>

        {/* Schedule New */}
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

      {/* VISITS LIST */}
      {visits.map((v) => {

        const date = v.visit_date_time ? new Date(v.visit_date_time) : null;
        const day = date ? date.getDate() : '--';
        const month = date
          ? date.toLocaleString('default', { month: 'short' }).toUpperCase()
          : '--';

        return (
          <div
            key={v.id}
            className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
          >

            {/* LEFT */}
            <div className="flex gap-4 items-center">

              {/* DATE BOX */}
              <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-white dark:bg-zinc-800 border text-xs font-semibold">
                <span className="text-red-500">{month}</span>
                <span className="text-zinc-900 dark:text-zinc-100">{day}</span>
              </div>

              {/* DETAILS */}
              <div className="space-y-1">

                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-blue-700">
                    Emerald Heights
                  </p>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-green-100 text-green-700 font-medium">
                    {getSiteVisitStatusLabel(v.visit_status)}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {v.visit_date_time ? formatDate(v.visit_date_time) : '--'}
                  </span>

                  {/* ✅ Dynamically show RM name from rms array */}
                  {/* <span>
                    EM: {getRmName(v.visit_assigned_to_rm)}
                  </span> */}
                </div>

                {/* {v.visit_location_url && (
                  
                    href={v.visit_location_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                  >
                    View on Google Maps →
                  </a>
                )} */}
              </div>
            </div>

            {/* RIGHT EDIT ICON */}
            <button
              onClick={() => {
                setSelectedVisit(v);
                setOpenDialog(true);
              }}
              className="text-zinc-400 hover:text-zinc-700"
            >
              <Pencil className="h-4 w-4" />
            </button>

          </div>
        );
      })}

      {/* DIALOG */}
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

      // ✅ Close dialog after success
      setOpenDialog(false);
      setSelectedVisit(null);

    } catch (err) {
      console.error("Schedule Visit Error:", err);
    }
  }}
  isLoading={isLoading}
/>

    </div>
  );
};