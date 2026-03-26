import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, Mail, MapPin, Briefcase, Calendar, Info } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { useGetLeadByIdQuery } from '../api/leadsApi';
import { formatDate } from '../../../utils';
import { useMasterDataLookup } from '../../../shared/hooks/useMasterDataLookup';
import { useGetAllUsersQuery } from '../../users/api/usersApi';

export const LeadDetailsPage = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();

  const { data: lead, isLoading, isError, error } = useGetLeadByIdQuery(
    { uuid: leadId || '' },
    { skip: !leadId }
  );

  const {
    getStatusLabel,
    getCustomerStatusLabel,
    getProjectLabel,
    getSourceLabel,
    getRmLabel,
    getEmLabel,
    masterData,
  } = useMasterDataLookup();

  // Find if source is INTEMP or ID 4
  const sourceObj = masterData?.sources?.find(s => s.id === lead?.source_id);
  const isInternalEmployeeSource = lead?.source_id === 4 || sourceObj?.code === 'INTEMP';

  const { data: users = [] } = useGetAllUsersQuery(
    { offset: 0 },
    { skip: !isInternalEmployeeSource }
  );

  const getSourceEmployeeName = () => {
    if (!lead?.source_employee_user_id) return '--';
    const user = users.find(u => u.id === lead.source_employee_user_id);
    return user ? `${user.first_name} ${user.last_name}` : `ID: ${lead.source_employee_user_id}`;
  };

  const fallback = (val: any) => val || <span className="text-zinc-400 italic">Not provided</span>;
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
        title={isLoading ? 'Loading...' : `Lead Information`}
        description={lead ? `Viewing details for ${lead.first_name || ''} ${lead.last_name || ''}` : ''}
      />

      {isLoading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <span className="text-zinc-500 animate-pulse">Fetching lead details...</span>
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-red-500">
          <p>Failed to load lead details.</p>
          <p className="text-sm text-zinc-500 mt-2">{(error as any)?.data?.message || 'Check connection or lead existence.'}</p>
        </div>
      )}

      {lead && (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl overflow-hidden">
          {/* Header section of the card */}
          <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-wrap gap-4 items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <User className="h-5 w-5 text-indigo-500" />
                {fallback(lead.first_name)} {fallback(lead.last_name)}
              </h3>
              <p className="text-sm font-medium text-zinc-500 mt-1">
                Lead ID: <span className="text-indigo-600 dark:text-indigo-400 font-mono bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded">{fallback(lead.lead_id)}</span>
              </p>
            </div>
          </div>

          <div className="p-6">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4 uppercase tracking-wider">General Details</h4>
            
            <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
              
              <div className="space-y-1">
                <dt className="text-xs font-semibold text-zinc-500 mb-1 flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5"/> Creation Date</dt>
                <dd className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {formatDate(lead.created_on)}
                </dd>
              </div>

              <div className="space-y-1">
                <dt className="text-xs font-semibold text-zinc-500 mb-1 flex items-center gap-1.5"><Info className="h-3.5 w-3.5"/> Lead Status</dt>
                <dd className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {getStatusLabel(lead.lead_status_id)}
                </dd>
              </div>

              <div className="space-y-1">
                <dt className="text-xs font-semibold text-zinc-500 mb-1 flex items-center gap-1.5"><Info className="h-3.5 w-3.5"/> Customer Status</dt>
                <dd className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {getCustomerStatusLabel(lead.customer_status_id)}
                </dd>
              </div>

              <div className="space-y-1">
                <dt className="text-xs font-semibold text-zinc-500 mb-1 flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5"/> Project</dt>
                <dd className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {getProjectLabel(lead.project_id)}
                </dd>
              </div>

              <div className="space-y-1">
                <dt className="text-xs font-semibold text-zinc-500 mb-1 flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5"/> Source</dt>
                <dd className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {getSourceLabel(lead.source_id)}
                </dd>
              </div>

              {isInternalEmployeeSource && (
                <div className="space-y-1">
                  <dt className="text-xs font-semibold text-zinc-500 mb-1 flex items-center gap-1.5"><User className="h-3.5 w-3.5"/> Source Employee</dt>
                  <dd className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {getSourceEmployeeName()}
                  </dd>
                </div>
              )}

              <div className="space-y-1">
                <dt className="text-xs font-semibold text-zinc-500 mb-1 flex items-center gap-1.5"><User className="h-3.5 w-3.5"/> Assigned RM</dt>
                <dd className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {getRmLabel(lead.assigned_to_rm)}
                </dd>
              </div>

              <div className="space-y-1">
                <dt className="text-xs font-semibold text-zinc-500 mb-1 flex items-center gap-1.5"><User className="h-3.5 w-3.5"/> Assigned EM</dt>
                <dd className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {getEmLabel(lead.assigned_to_em)}
                </dd>
              </div>

              <div className="space-y-1">
                <dt className="text-xs font-semibold text-zinc-500 mb-1 flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5"/> Occupation</dt>
                <dd className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {fallback(lead.occupation)}
                </dd>
              </div>

              <div className="space-y-1">
                <dt className="text-xs font-semibold text-zinc-500 mb-1 flex items-center gap-1.5"><Phone className="h-3.5 w-3.5"/> Phone Number</dt>
                <dd className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {fallback(lead.phone_number)}
                </dd>
              </div>

              <div className="space-y-1">
                <dt className="text-xs font-semibold text-zinc-500 mb-1 flex items-center gap-1.5"><Mail className="h-3.5 w-3.5"/> Email Address</dt>
                <dd className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {fallback(lead.email_address)}
                </dd>
              </div>

            </dl>

            <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4 uppercase tracking-wider">Address Details</h4>
              <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                
                <div className="col-span-full md:col-span-2 lg:col-span-3 space-y-1">
                  <dt className="text-xs font-semibold text-zinc-500 mb-1 flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5"/> Address</dt>
                  <dd className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {fallback(lead.address)}
                  </dd>
                </div>

                <div className="space-y-1">
                  <dt className="text-xs font-semibold text-zinc-500 mb-1">City</dt>
                  <dd className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {fallback(lead.city)}
                  </dd>
                </div>

                <div className="space-y-1">
                  <dt className="text-xs font-semibold text-zinc-500 mb-1">State</dt>
                  <dd className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {fallback(lead.state)}
                  </dd>
                </div>

                <div className="space-y-1">
                  <dt className="text-xs font-semibold text-zinc-500 mb-1">Country</dt>
                  <dd className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {fallback(lead.country)}
                  </dd>
                </div>

                <div className="space-y-1">
                  <dt className="text-xs font-semibold text-zinc-500 mb-1">Zip Code</dt>
                  <dd className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {fallback(lead.zip)}
                  </dd>
                </div>

              </dl>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};
