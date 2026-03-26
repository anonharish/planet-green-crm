import React from 'react';
import { formatDate } from '../../../../utils';
import { MapPin, Calendar, Link as LinkIcon } from 'lucide-react';
import type { LeadVisit } from '../../types';

interface LeadVisitsTabProps {
  visits?: LeadVisit[];
  getSiteVisitStatusLabel: (id: number) => string;
}

export const LeadVisitsTab = ({ visits, getSiteVisitStatusLabel }: LeadVisitsTabProps) => {
  if (!visits || visits.length === 0) {
    return (
      <div className="p-8 text-center text-zinc-500 border border-zinc-200 dark:border-zinc-800 rounded-xl mt-4 bg-white dark:bg-zinc-950">
        No visit history scheduled.
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      {visits.map((v) => (
        <div key={v.id} className="flex gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm transition-all hover:shadow-md">
          <div className="mt-1 bg-amber-100 dark:bg-amber-900/30 p-2 rounded-full h-fit shrink-0">
            <MapPin className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-0">
              <div className="space-y-1">
                <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  Status: {getSiteVisitStatusLabel(v.visit_status)}
                </p>
                {v.visit_date_time && (
                  <p className="text-xs text-zinc-500 flex items-center gap-1.5 font-medium">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(v.visit_date_time)}
                  </p>
                )}
              </div>
              <span className="text-xs text-zinc-500">
                Created on {formatDate(v.created_on)}
              </span>
            </div>
            
            {v.visit_location_url && (
              <a 
                href={v.visit_location_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                <LinkIcon className="h-3.5 w-3.5" />
                View Google Maps Location
              </a>
            )}

            {v.visit_remarks && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 italic">
                "{v.visit_remarks}"
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
