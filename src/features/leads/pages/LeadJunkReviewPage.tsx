import React, { useState } from 'react';
import type { Lead } from '../types';
import { Button } from '../../../components/ui/button';
import { ChevronLeft, UserPlus, Trash2, AlertCircle, Star, PhoneOff, Ban, PhoneForwarded } from 'lucide-react';
import { useMasterDataLookup } from '../../../shared/hooks/useMasterDataLookup';

interface LeadJunkReviewPageProps {
  lead: Lead;
  onBack: () => void;
  onReassign: (reason: string) => void;
  onApprove: (reason: string) => void;
}

export const LeadJunkReviewPage: React.FC<LeadJunkReviewPageProps> = ({
  lead,
  onBack,
  onReassign,
  onApprove,
}) => {
  const { getProjectLabel, getRmLabel } = useMasterDataLookup();
  const [reassignmentReason, setReassignmentReason] = useState("");
  const [expanded, setExpanded] = useState(false);

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-dashed border-zinc-200">
        <p className="text-zinc-500 font-medium">Loading lead information...</p>
      </div>
    );
  }

  const fallback = (val: any) => val || <span className="text-zinc-400 italic">Not provided</span>;

  // Map initials for RM
  const rmLabel = getRmLabel(lead?.assigned_to_rm);
  const initials = rmLabel !== '--' ? rmLabel.split(' ').map(n => n[0]).join('') : 'UN';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-12 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onBack}
          className="gap-2 text-zinc-500 hover:text-[#0f3d6b] transition-colors p-0 hover:bg-transparent"
        >
          <ChevronLeft size={20} />
          <span className="font-bold text-sm">Back to Queue</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        <div className="lg:col-span-6 space-y-6">
          {/* Lead Header Card */}
          <div className="bg-white dark:bg-zinc-950 p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[9px] font-black uppercase rounded-full tracking-widest border border-rose-100 dark:bg-rose-950 dark:border-rose-900">JUNKED</span>
                <span className="text-zinc-400 font-bold text-xs tracking-tight">Lead ID: #{lead.lead_id}</span>
              </div>

              <div className="space-y-1">
                <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                  {lead.first_name} {lead.last_name}
                </h2>
                <p className="text-[#0f3d6b] font-bold text-base">{getProjectLabel(lead.project_id)}</p>
              </div>

              <div className="grid grid-cols-2 gap-10 pt-2">
                <div className="space-y-1">
                  <p className="text-zinc-400 font-bold text-[9px] uppercase tracking-widest">Phone Number</p>
                  <p className="text-zinc-900 dark:text-zinc-100 font-black text-sm">{fallback(lead.phone_number)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-zinc-400 font-bold text-[9px] uppercase tracking-widest">Email Address</p>
                  <p className="text-zinc-900 dark:text-zinc-100 font-black text-sm lowercase">{fallback(lead.email_address)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Junk Reason Card */}
          <div className="bg-white dark:bg-zinc-950 p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-[0_2px_15px_rgba(0,0,0,0.03)] space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-50 text-rose-500 rounded-xl dark:bg-rose-950 dark:border-rose-900 border border-rose-100">
                <AlertCircle size={20} strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 tracking-tight">Junk Reason Description</h3>
            </div>

            <div className="pl-1 space-y-5">
              <blockquote className="text-zinc-600 dark:text-zinc-400 font-semibold text-base leading-relaxed break-words">
                "{expanded || (lead.junk_reason || '').length <= 100
                  ? (lead.junk_reason || (lead.remarks && lead.remarks.length > 0 ? lead.remarks[0].remark : 'No specific reason recorded.'))
                  : `${(lead.junk_reason || '').substring(0, 100)}...`}"

                {(lead.junk_reason || '').length > 100 && (
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="ml-2 text-[#0f3d6b] hover:text-indigo-700 font-bold text-xs uppercase tracking-wider transition-colors"
                  >
                    {expanded ? 'View Less' : 'View More'}
                  </button>
                )}
              </blockquote>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#0f3d6b] flex items-center justify-center text-[10px] font-black text-white uppercase shadow-md">
                  {initials}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-900 dark:text-zinc-100 font-black text-xs">{rmLabel === '--' ? 'System' : rmLabel}</span>
                  <span className="text-zinc-300">•</span>
                  <span className="text-zinc-400 font-bold text-xs tracking-tight">2 hours ago</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar (40% Column) */}
        <div className="lg:col-span-4 space-y-6">
          {/* RM Profile Card */}
          <div className="bg-zinc-50 dark:bg-zinc-900/50 p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800 text-center space-y-5">
            <div className="relative inline-block">
              <div className="w-20 h-20 rounded-full bg-[#dae5f1] dark:bg-zinc-800 flex items-center justify-center text-2xl font-black text-[#7c95b4] uppercase shadow-inner border-4 border-white dark:border-zinc-950">
                {initials}
              </div>
              <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-zinc-50 dark:border-zinc-900 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1 border-b-2 border-r-2 border-white -rotate-45 mb-0.5" />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">{rmLabel === '--' ? 'Unassigned' : rmLabel}</h3>
              <p className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest">Relationship Manager (RM)</p>
            </div>

            <div className="flex items-center justify-center gap-2">
              <div className="px-2.5 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full flex items-center gap-1">
                <span className="text-[10px] font-black text-zinc-900 dark:text-zinc-100">4.8</span>
                <Star size={8} className="fill-zinc-900 text-zinc-900 dark:fill-zinc-400 dark:text-zinc-400" />
                <span className="text-[9px] font-bold text-zinc-400">Rating</span>
              </div>
              <div className="px-2.5 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full">
                <span className="text-[9px] font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Top Tier</span>
              </div>
            </div>
          </div>

          {/* Action Card
          <div className="bg-white dark:bg-zinc-950 p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-[0_2px_15px_rgba(0,0,0,0.03)] space-y-6">
            <div className="space-y-3">
              <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-100 tracking-tight">Reassignment Reason</h4>
              <textarea
                className="w-full h-32 bg-zinc-50/20 dark:bg-zinc-900/30 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 focus:outline-none focus:border-[#0f3d6b] transition-all resize-none text-zinc-600 dark:text-zinc-300 font-medium text-xs leading-relaxed"
                placeholder="Reason for reassignment..."
                value={reassignmentReason}
                onChange={(e) => setReassignmentReason(e.target.value)}
              />
            </div> */}

            <div className="space-y-2">
              <Button
                onClick={() => onReassign(reassignmentReason)}
                className="w-full bg-[#0f3d6b] hover:bg-[#1e293b] text-white font-black py-5 rounded-xl gap-2 text-sm shadow transition-all active:scale-[0.98]"
              >
                <UserPlus size={18} strokeWidth={2.5} />
                Reassign to RM
              </Button>
              <Button
                variant="outline"
                onClick={() => onApprove(reassignmentReason)}
                className="w-full bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-rose-500 font-black py-5 rounded-xl gap-2 text-sm hover:bg-rose-50 hover:border-rose-100 transition-all active:scale-[0.98]"
              >
                <Trash2 size={18} strokeWidth={2.5} />
                Approve Junk
              </Button>
            </div>
          </div>
        </div>
      </div>
    // </div>
  );
};
