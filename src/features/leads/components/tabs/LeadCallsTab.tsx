import React from 'react';
import { formatDate } from '../../../../utils';
import { PhoneCall, Clock } from 'lucide-react';
import type { LeadCall } from '../../types';

interface LeadCallsTabProps {
  calls?: LeadCall[];
}

export const LeadCallsTab = ({ calls }: LeadCallsTabProps) => {
  if (!calls || calls.length === 0) {
    return (
      <div className="p-8 text-center text-zinc-500 border border-zinc-200 dark:border-zinc-800 rounded-xl mt-4 bg-white dark:bg-zinc-950">
        No call history available.
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      {calls.map((c) => (
        <div key={c.id} className="flex gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm transition-all hover:shadow-md">
          <div className="mt-1 bg-green-100 dark:bg-green-900/30 p-2 rounded-full h-fit shrink-0">
            <PhoneCall className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-0">
              <div className="space-y-0.5">
                <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                  {c.from_number && c.to_number ? `${c.from_number} → ${c.to_number}` : 'Unknown Call Route'}
                </p>
                {c.call_duration_in_seconds !== null && (
                  <p className="text-xs text-zinc-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {Math.floor(c.call_duration_in_seconds / 60)}m {c.call_duration_in_seconds % 60}s
                  </p>
                )}
              </div>
              <span className="text-xs text-zinc-500 font-medium">
                {formatDate(c.created_on)}
              </span>
            </div>
            
            {c.call_summary && (
              <div className="text-sm text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                <span className="font-medium text-zinc-900 dark:text-zinc-200 mb-1 block">Summary</span>
                {c.call_summary}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
