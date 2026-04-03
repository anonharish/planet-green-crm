import React from 'react';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { ClipboardList } from 'lucide-react';

export const ScheduledVisitsPage = () => {
  return (
    <div className="space-y-4">
      <PageHeader 
        title="Scheduled Visits" 
        description="Monitor and manage all upcoming scheduled property visits."
      />
      <div className="border rounded-lg p-12 bg-white dark:bg-zinc-950 shadow-sm flex flex-col items-center justify-center text-center">
        <ClipboardList className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mb-4" />
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Visits Application</h3>
        <p className="text-zinc-500 mt-2 max-w-sm">
          This feature is currently under construction. Check back soon for updates to the scheduled visits workflow.
        </p>
      </div>
    </div>
  );
};
