import React from 'react';
import type { JunkLead } from '../data/junkLeadsData';
import { Button } from '../../../components/ui/button';
import { ChevronLeft, UserPlus, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface LeadJunkReviewPageProps {
  lead: JunkLead;
  onBack: () => void;
  onReassign: () => void;
  onApprove: () => void;
}

export const LeadJunkReviewPage: React.FC<LeadJunkReviewPageProps> = ({
  lead,
  onBack,
  onReassign,
  onApprove,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-12">
      <Button 
        variant="ghost" 
        onClick={onBack} 
        className="gap-2 text-zinc-500 hover:text-[#0f3d6b] transition-colors p-0 hover:bg-transparent"
      >
        <ChevronLeft size={20} />
        <span className="font-bold">Back to Queue</span>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Lead Header Card */}
          <div className="bg-white dark:bg-zinc-950 p-8 rounded-[2.5rem] border border-zinc-200/50 dark:border-zinc-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-black uppercase rounded-full tracking-widest border border-rose-100 dark:bg-rose-950 dark:border-rose-900">JUNKED</span>
                  <span className="text-zinc-400 font-bold text-sm tracking-tight uppercase">Lead ID: #{lead.lead_id}</span>
                </div>
                <div className="space-y-1">
                  <h2 className="text-4xl font-black text-[#0f3d6b] tracking-tight">{lead.customer_name}</h2>
                  <p className="text-[#1e293b] font-bold text-base">{lead.project}</p>
                </div>
                <div className="grid grid-cols-2 gap-8 pt-4">
                  <div className="space-y-1.5 text-xs">
                    <p className="text-zinc-400 font-black uppercase tracking-wider">Phone Number</p>
                    <p className="text-zinc-900 dark:text-zinc-100 font-extrabold text-sm">{lead.phone_number}</p>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <p className="text-zinc-400 font-black uppercase tracking-wider">Email Address</p>
                    <p className="text-zinc-900 dark:text-zinc-100 font-extrabold text-sm">{lead.email_address}</p>
                  </div>
                </div>
              </div>
              <div className="bg-zinc-50/50 dark:bg-zinc-900/10 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800/50 min-w-[280px]">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#0f3d6b] flex items-center justify-center text-xl font-black text-white uppercase shadow-lg">
                    {lead.relationship_manager.initials}
                  </div>
                  <div className="text-center space-y-1">
                    <h3 className="font-black text-zinc-900 dark:text-zinc-100 text-lg tracking-tight">{lead.relationship_manager.name}</h3>
                    <p className="text-zinc-400 font-bold text-[11px] uppercase tracking-wider">Relationship Manager (RM)</p>
                  </div>
                  {lead.relationship_manager.rating && (
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[10px] font-black text-zinc-500 shadow-sm uppercase tracking-wider">{lead.relationship_manager.rating} Rating</span>
                      <span className="px-3 py-1 bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-lg text-[10px] font-black text-zinc-500 shadow-sm uppercase tracking-wider text-emerald-500">{lead.relationship_manager.tag}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Junk Reason Card */}
          <div className="bg-white dark:bg-zinc-950 p-8 rounded-[2.5rem] border border-zinc-200/50 dark:border-zinc-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-50 text-rose-500 rounded-2xl dark:bg-rose-950 dark:border-rose-900 border border-rose-100">
                <AlertCircle size={22} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-black text-[#0f3d6b] tracking-tight">Junk Reason Description</h3>
            </div>
            <div className="pl-2 space-y-4">
              <blockquote className="text-zinc-600 dark:text-zinc-400 font-bold text-lg leading-relaxed italic">
                "{lead.junk_reason_description || 'No detailed description provided.'}"
              </blockquote>
              <div className="flex items-center gap-2 text-[11px]">
                <div className="w-6 h-6 rounded-full bg-[#0f3d6b] flex items-center justify-center text-[9px] font-black text-white uppercase group-hover:scale-110 transition-transform">
                  {lead.relationship_manager.initials}
                </div>
                <span className="text-zinc-500 font-black tracking-tight">{lead.relationship_manager.name} • 2 hours ago</span>
              </div>
            </div>
          </div>

          {/* Verification Audit Card */}
          <div className="bg-white dark:bg-zinc-950 p-8 rounded-[2.5rem] border border-zinc-200/50 dark:border-zinc-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6">
            <p className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] px-1">Verification Audit</p>
            <div className="space-y-3">
              {lead.verification_audit.map((audit) => (
                <div key={audit.attempt} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/20 rounded-2xl border border-zinc-100/50 dark:border-zinc-900/50 transition-all hover:translate-x-1 group">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-white dark:bg-zinc-800 text-rose-500 rounded-xl border border-zinc-100 dark:border-zinc-700 shadow-sm transition-colors group-hover:bg-rose-50">
                      <Clock size={16} strokeWidth={2.5} />
                    </div>
                    <span className="text-zinc-900 dark:text-zinc-100 font-black text-sm tracking-tight capitalize">Attempt {audit.attempt}: {audit.status}</span>
                  </div>
                  <span className="text-zinc-400 font-bold text-xs tabular-nums tracking-widest uppercase">{audit.time}</span>
                </div>
              ))}
              {lead.verification_audit.length === 0 && (
                <div className="py-8 text-center text-zinc-400 font-bold text-sm tracking-tight italic">
                  No verification attempts recorded.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-950 p-8 rounded-[2.5rem] border border-zinc-200/50 dark:border-zinc-800/50 shadow-[0_12px_40px_rgb(0,0,0,0.04)] dark:shadow-none space-y-10">
            <div className="space-y-4">
              <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-widest pl-1">Reassignment Reason</h4>
              <div className="relative group">
                <textarea 
                  className="w-full h-48 bg-zinc-50/50 dark:bg-zinc-900 px-6 py-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 dark:focus:ring-indigo-500/5 transition-all resize-none text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed shadow-inner"
                  placeholder="Select an RM and provide reason for reassignment to restore this lead..."
                  defaultValue="Please re-verify the number with the marketing source. I've cross-checked the CRM and the lead has a valid history with our other project."
                />
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <Button 
                onClick={onReassign}
                className="w-full bg-[#0f3d6b] hover:bg-[#0c3156] text-white font-black py-8 rounded-[1.5rem] gap-3 text-lg shadow-xl shadow-indigo-900/10 transition-all hover:translate-y-[-2px] active:translate-y-0"
              >
                <UserPlus size={22} strokeWidth={2.5} />
                Reassign to RM
              </Button>
              <Button 
                variant="outline" 
                onClick={onApprove}
                className="w-full bg-white dark:bg-zinc-950 border-2 border-rose-100 dark:border-rose-900 text-rose-500 font-black py-8 rounded-[1.5rem] gap-3 text-lg hover:bg-rose-50/50 dark:hover:bg-rose-900/10 transition-all hover:border-rose-500 active:translate-y-0"
              >
                <CheckCircle2 size={22} strokeWidth={2.5} />
                Approve Junk
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
