import React, { useRef, useState, useEffect } from "react";
import { Phone, TrendingUp, UserPlus, Webhook, MessageSquare, FileText, Clock } from "lucide-react";
// TODO: Replace the placeholders below with your Figma icon imports, e.g.:
// import { CallIcon, StageIcon, AssignIcon, WebhookIcon, RemarkIcon, DefaultIcon } from "../../../assets/icons";

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
    case "CALL_ATTEMPTED":
    case "CALL":
      return {
        icon: <Phone className="h-3.5 w-3.5 text-[#063669]" />, // TODO: Replace with your Figma icon
        label: "Call Attempted",
      };
    case "STAGE_CHANGED":
    case "STATUS_CHANGED":
      return {
        icon: <TrendingUp className="h-3.5 w-3.5 text-[#063669]" />, // TODO: Replace with your Figma icon
        label: "Stage moved to In Progress",
      };
    case "ASSIGNED":
    case "RM_ASSIGNED":
      return {
        icon: <UserPlus className="h-3.5 w-3.5 text-[#063669]" />, // TODO: Replace with your Figma icon
        label: "Assigned to RM",
      };
    case "LEAD_CREATED":
    case "WEBHOOK":
      return {
        icon: <Webhook className="h-3.5 w-3.5 text-[#063669]" />, // TODO: Replace with your Figma icon
        label: "Lead Created",
      };
    case "REMARK_ADDED":
    case "NOTE":
      return {
        icon: <MessageSquare className="h-3.5 w-3.5 text-[#063669]" />, // TODO: Replace with your Figma icon
        label: "Remark Added",
      };
    default:
      return {
        icon: <FileText className="h-3.5 w-3.5 text-[#063669]" />, // TODO: Replace with your Figma icon
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
    activity_type: "LEAD_CREATED",
    created_on: new Date(Date.now() - 15.5 * 60 * 60 * 1000).toISOString(),
  },
];

const activityLabelMap: Record<string, string> = {
  CALL_ATTEMPTED: "Call Attempted",
  CALL: "Call Attempted",
  STAGE_CHANGED: "Stage moved to In Progress",
  STATUS_CHANGED: "Status Changed",
  ASSIGNED: "Assigned to RM",
  RM_ASSIGNED: "Assigned to RM",
  LEAD_CREATED: "Lead created via Facebook webhook",
  WEBHOOK: "Lead created via Webhook",
  REMARK_ADDED: "Remark Added",
  NOTE: "Note Added",
};

const ICON_SIZE = 32;
const ICON_TOP_OFFSET = 14;
const ICON_CENTER = ICON_TOP_OFFSET + ICON_SIZE / 2;

export const LeadRemarksTab = ({ remarks }: LeadRemarksTabProps) => {
  const data = remarks && remarks.length > 0 ? remarks : dummyRemarks;
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
        {data.map((item, index) => {
          const meta = getActivityMeta(item.activity_type);
          const label = activityLabelMap[item.activity_type] || meta.label;

          return (
            <div
              key={item.id ?? index}
              ref={(el) => { rowRefs.current[index] = el; }}
              className="flex items-start gap-4"
            >
              {/* Icon — no background, just border + white fill to sit on the line */}
              <div className="flex-shrink-0 mt-3.5 z-10">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 shadow-[0_0_0_6px_rgba(99,102,241,0.08)]">
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
                  <span className="text-[11px] font-medium text-zinc-400 uppercase whitespace-nowrap flex-shrink-0 mt-0.5">
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