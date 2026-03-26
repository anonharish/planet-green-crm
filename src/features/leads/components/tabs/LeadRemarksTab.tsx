import React from 'react';
import { formatDate } from '../../../../utils';
import { Activity } from 'lucide-react';
import type { LeadRemark } from '../../types';

interface LeadRemarksTabProps {
  remarks?: LeadRemark[];
}

export const LeadRemarksTab = ({ remarks }: LeadRemarksTabProps) => {
  if (!remarks || remarks.length === 0) {
    return (
      <div className="p-8 text-center text-zinc-500 border border-zinc-200 dark:border-zinc-800 rounded-xl mt-4 bg-white dark:bg-zinc-950">
        No activity remarks found.
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      {remarks.map((r) => (
        <div key={r.id} className="flex gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm transition-all hover:shadow-md">
          <div className="mt-1 bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full h-fit shrink-0">
            <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex justify-between items-start">
              <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                {r.activity_type.replace(/_/g, ' ')}
              </p>
              <span className="text-xs text-zinc-500 font-medium">
                {formatDate(r.created_on)}
              </span>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {r.remark}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
