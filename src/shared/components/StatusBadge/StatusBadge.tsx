import React from 'react';
import { Badge } from '../../../components/ui/badge';

type LeadStatus = 'new' | 'assigned' | 'contacted' | 'interested' | 'not_interested' | 'converted' | string;

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  new:            { label: 'New',            className: 'bg-blue-100 text-blue-700 border-blue-200' },
  assigned:       { label: 'Assigned',       className: 'bg-purple-100 text-purple-700 border-purple-200' },
  contacted:      { label: 'Contacted',      className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  interested:     { label: 'Interested',     className: 'bg-green-100 text-green-700 border-green-200' },
  not_interested: { label: 'Not Interested', className: 'bg-red-100 text-red-700 border-red-200' },
  converted:      { label: 'Converted',      className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
};

interface StatusBadgeProps {
  status: LeadStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config = STATUS_CONFIG[status] ?? { label: status, className: 'bg-zinc-100 text-zinc-600 border-zinc-200' };
  return (
    <Badge variant="outline" className={`font-medium text-xs ${config.className}`}>
      {config.label}
    </Badge>
  );
};
