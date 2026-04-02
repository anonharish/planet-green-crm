import React, { useRef, useState, useEffect } from "react";
import { cn } from "../../../../utils";
import { 
  Phone, 
  TrendingUp, 
  UserPlus, 
  Webhook, 
  MessageSquare, 
  FileText, 
  Clock, 
  Edit, 
  UserCheck, 
  CheckCircle,
  MessageCircle
} from "lucide-react";

interface Remark {
  id: number;
  remark: string;
  activity_type: string;
  created_on: string;
  lead_uuid?: string;
}

interface LeadRemarksTabProps {
  remarks?: Remark[];
}

const getActivityMeta = (activityType: string) => {
  switch (activityType) {
    case "CREATED":
    case "LEAD_CREATED":
    case "WEBHOOK":
      return {
        icon: <UserPlus className="h-3.5 w-3.5 text-blue-600" />,
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        shadowColor: "shadow-[0_0_0_6px_rgba(37,99,235,0.08)]",
        label: "Lead Created",
      };
    case "FIELD_CHANGED":
      return {
        icon: <Edit className="h-3.5 w-3.5 text-amber-600" />,
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200",
        shadowColor: "shadow-[0_0_0_6px_rgba(217,119,6,0.08)]",
        label: "Field Updated",
      };
    case "STATUS_CHANGED":
    case "STAGE_CHANGED":
      return {
        icon: <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />,
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-200",
        shadowColor: "shadow-[0_0_0_6px_rgba(5,150,105,0.08)]",
        label: "Status Changed",
      };
    case "ASSIGNED":
    case "RM_ASSIGNED":
      return {
        icon: <UserCheck className="h-3.5 w-3.5 text-purple-600" />,
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200",
        shadowColor: "shadow-[0_0_0_6px_rgba(147,51,234,0.08)]",
        label: "Lead Assigned",
      };
    case "REMARK_ADDED":
    case "NOTE":
      return {
        icon: <MessageSquare className="h-3.5 w-3.5 text-slate-600" />,
        bgColor: "bg-slate-50",
        borderColor: "border-slate-200",
        shadowColor: "shadow-[0_0_0_6px_rgba(71,85,105,0.08)]",
        label: "Remark Added",
      };
    case "CALL_SUMMARY":
    case "CALL":
    case "CALL_ATTEMPTED":
      return {
        icon: <Phone className="h-3.5 w-3.5 text-indigo-600" />,
        bgColor: "bg-indigo-50",
        borderColor: "border-indigo-200",
        shadowColor: "shadow-[0_0_0_6px_rgba(79,70,229,0.08)]",
        label: "Call Summary",
      };
    case "CHAT_SUMMARY":
      return {
        icon: <MessageCircle className="h-3.5 w-3.5 text-sky-600" />,
        bgColor: "bg-sky-50",
        borderColor: "border-sky-200",
        shadowColor: "shadow-[0_0_0_6px_rgba(2,132,199,0.08)]",
        label: "Chat Summary",
      };
    default:
      return {
        icon: <FileText className="h-3.5 w-3.5 text-zinc-500" />,
        bgColor: "bg-zinc-50",
        borderColor: "border-zinc-200",
        shadowColor: "shadow-[0_0_0_6px_rgba(113,113,122,0.08)]",
        label: "Activity",
      };
  }
};

const formatActivityDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    return (
      date.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase() +
      ", " +
      date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
    );
  } catch {
    return dateStr;
  }
};

const dummyRemarks: Remark[] = [
  {
    id: 1,
    remark: "System recorded an outbound call attempt. No answer. Voicemail dropped automatically.",
    activity_type: "CALL_ATTEMPTED",
    created_on: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    remark: "Lead status updated following initial review of lead quality score (8.2/10).",
    activity_type: "STAGE_CHANGED",
    created_on: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    remark: "Auto-assignment engine matched lead with Vikram Singh based on high-value segment expertise.",
    activity_type: "RM_ASSIGNED",
    created_on: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    remark: "Inbound lead captured from 'Q4 Luxury Living' campaign. Meta ID: fb_9921_x32.",
    activity_type: "CREATED",
    created_on: new Date(Date.now() - 15.5 * 60 * 60 * 1000).toISOString(),
  },
];

const activityLabelMap: Record<string, string> = {
  CREATED: "Lead Created",
  LEAD_CREATED: "Lead Created",
  WEBHOOK: "Lead created via Webhook",
  FIELD_CHANGED: "Information Updated",
  STATUS_CHANGED: "Lead Status Changed",
  STAGE_CHANGED: "Lead Stage Changed",
  ASSIGNED: "Assignee Updated",
  RM_ASSIGNED: "RM Assigned",
  REMARK_ADDED: "New Remark Added",
  NOTE: "Note Added",
  CALL_SUMMARY: "Call Recording Summary",
  CALL: "Call Recorded",
  CALL_ATTEMPTED: "Call Attempted",
  CHAT_SUMMARY: "Chat Transcript Summary",
};

const ICON_SIZE = 32;
const ICON_TOP_OFFSET = 14;
const ICON_CENTER = ICON_TOP_OFFSET + ICON_SIZE / 2;

export const LeadRemarksTab = ({ remarks }: LeadRemarksTabProps) => {
  const data = remarks && remarks.length > 0 ? remarks : [];
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [lineStyle, setLineStyle] = useState<{ top: number; height: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || data.length < 2) return;

    const firstRow = rowRefs.current[0];
    const lastRow = rowRefs.current[data.length - 1];
    if (!firstRow || !lastRow) return;

    const containerTop = containerRef.current.getBoundingClientRect().top;
    const firstIconCenter = firstRow.getBoundingClientRect().top - containerTop + ICON_CENTER;
    const lastIconCenter = lastRow.getBoundingClientRect().top - containerTop + ICON_CENTER;

    setLineStyle({
      top: firstIconCenter,
      height: lastIconCenter - firstIconCenter,
    });
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center space-y-2">
          <Clock className="h-8 w-8 text-zinc-300 mx-auto" />
          <p className="text-sm text-zinc-400">No activity remarks found.</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative pl-2">

      {/* Absolute line from center of first icon to center of last icon */}
      {lineStyle && (
        <div
          className="absolute left-[1.25rem] w-px bg-zinc-200 dark:bg-zinc-700 z-0"
          style={{ top: lineStyle.top, height: lineStyle.height }}
        />
      )}

      <div className="space-y-6 relative z-10">
        {data.map((item: Remark, index: number) => {
          const meta = getActivityMeta(item.activity_type);
          const label = activityLabelMap[item.activity_type] || meta.label;

          return (
            <div
              key={item.id ?? index}
              ref={(el) => { rowRefs.current[index] = el; }}
              className="flex items-start gap-4"
            >
              {/* Icon — no background, just border + white fill to sit on the line */}
              <div className="shrink-0 mt-3.5 z-10">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border transition-all",
                  meta.bgColor,
                  meta.borderColor,
                  meta.shadowColor
                )}>
                  {meta.icon}
                </div>
              </div>

              {/* Card */}
              <div className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-xl px-5 py-4 shadow-sm">
                <div className="flex items-start justify-between gap-6">
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{label}</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{item.remark}</p>
                  </div>
                  <span className="text-[11px] font-medium text-zinc-400 uppercase whitespace-nowrap shrink-0 mt-0.5">
                    {formatActivityDate(item.created_on)}
                  </span>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};