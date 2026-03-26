import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';

export const LeadDetailsPage = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/leads')}
          className="gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Leads Dashboard
        </Button>
      </div>
      
      <PageHeader
        title={`Lead Details`}
        description={`Viewing detailed information for Lead ID: ${leadId}`}
      />

      <div className="border rounded-lg p-6 bg-white dark:bg-zinc-950 shadow-sm min-h-[400px]">
        {/* Placeholder for lead details content */}
        <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-4 pt-12">
          <p>Detailed view components and data fetching will go here.</p>
          <div className="text-sm border border-zinc-200 dark:border-zinc-800 rounded px-3 py-1 bg-zinc-50 dark:bg-zinc-900">
            Internal Lead UUID / ID: <span className="font-mono text-indigo-600 dark:text-indigo-400">{leadId}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
