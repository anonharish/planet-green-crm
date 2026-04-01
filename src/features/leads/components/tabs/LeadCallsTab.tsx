import React from 'react';
import { formatDate } from '../../../../utils';
import { ArrowUpRight, ArrowDownLeft, Play, Volume2, Download } from 'lucide-react';
import type { LeadCall } from '../../types';

// ✅ Import your PNG icon (update path if needed)
import aiIcon from '@/assets/icons/ai-icon.png';

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
    <div className="space-y-6 mt-6">
      {calls.map((c, index) => {
        const isOutgoing = index % 2 === 0; // TEMP (replace later with real field)

        const duration = c.call_duration_in_seconds
          ? `${Math.floor(c.call_duration_in_seconds / 60)}m ${c.call_duration_in_seconds % 60}s`
          : '--';

        return (
          <div
            key={c.id}
            className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden"
          >
            
            {/* HEADER */}
            <div className="flex justify-between items-center px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
              
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  isOutgoing 
                    ? 'bg-green-100 dark:bg-green-900/30' 
                    : 'bg-orange-100 dark:bg-orange-900/30'
                }`}>
                  {isOutgoing ? (
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                  ) : (
                    <ArrowDownLeft className="h-4 w-4 text-orange-500" />
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {isOutgoing ? 'Outgoing Call - Connected' : 'Incoming Call - Connected'}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {formatDate(c.created_on)}
                  </p>
                </div>
              </div>

              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {duration}
              </p>
            </div>

            {/* AUDIO PLAYER */}
            <div className="px-4 py-3">
              <div className="flex items-center gap-3 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 bg-zinc-50 dark:bg-zinc-900">

                {/* PLAY BUTTON */}
                <button className="p-2 rounded-full bg-blue-600 text-white">
                  <Play className="h-4 w-4" />
                </button>

                {/* PROGRESS BAR */}
                <div className="flex-1">
                  <div className="h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full relative">
                    <div className="absolute left-0 top-0 h-1.5 w-1/3 bg-blue-600 rounded-full" />
                  </div>

                  <div className="flex justify-between text-xs text-zinc-500 mt-1">
                    <span>01:30</span>
                    <span>{duration}</span>
                  </div>
                </div>

                {/* RIGHT ICONS */}
                <div className="flex items-center gap-2 text-zinc-500">
                  <Volume2 className="h-4 w-4 cursor-pointer" />
                  <Download className="h-4 w-4 cursor-pointer" />
                </div>

              </div>
            </div>

            {/* AI SUMMARY */}
            {c.call_summary && (
              <div className="px-4 pb-4">
                
                <div className="flex items-center gap-2 mb-2">
                  
                  {/* ✅ PNG AI ICON */}
                  <img 
                    src={aiIcon} 
                    alt="AI" 
                    className="h-4 w-4 object-contain"
                  />

                  <p className="text-xs font-semibold text-zinc-400 uppercase">
                    AI Call Summary
                  </p>
                </div>

                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {c.call_summary}
                </p>

              </div>
            )}

          </div>
        );
      })}
    </div>
  );
};