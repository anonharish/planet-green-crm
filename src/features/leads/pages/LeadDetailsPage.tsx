import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, User, Phone, Mail, MapPin, Briefcase, Calendar, Info } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { useGetLeadByIdQuery } from '../api/leadsApi';
import { formatDate } from '../../../utils';
import { useMasterDataLookup } from '../../../shared/hooks/useMasterDataLookup';
import { useGetAllUsersQuery } from '../../users/api/usersApi';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { LeadRemarksTab } from '../components/tabs/LeadRemarksTab';
import { LeadCallsTab } from '../components/tabs/LeadCallsTab';
import { LeadVisitsTab } from '../components/tabs/LeadVisitsTab';
import { LeadChatsTab } from '../components/tabs/LeadChatsTab';

export const LeadDetailsPage = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const fromCustomer = location.state?.fromCustomer;

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

  const sourceObj = masterData?.sources?.find(s => s.id === lead?.source_id);
  const isInternalEmployeeSource = lead?.source_id === 4 || sourceObj?.code === 'INTEMP';

  // ✅ FIXED: Always fetch users regardless of source
  // Previously had skip: !isInternalEmployeeSource which caused rms=[] for non-INTEMP leads
  const { data: users = [] } = useGetAllUsersQuery({ offset: 0 });

  const getSourceEmployeeName = () => {
    if (!lead?.source_employee_user_id) return '--';
    const user = users.find(u => u.id === lead.source_employee_user_id);
    return user ? `${user.first_name} ${user.last_name}` : `ID: ${lead.source_employee_user_id}`;
  };

  const fallback = (val: any) => val || <span className="text-zinc-400">--</span>;
  console.log("CALLS DATA:", lead?.calls);

  const dummyChats: any = [
    {
      id: 1,
      chat_summary:
        "Hi Vikram, I reviewed the brochure for the penthouse in SkyGardens. The floor plan looks interesting, but I have concerns about the parking space allocation. Does it come with 3 dedicated slots?",
      created_on: new Date().toISOString(),
      lead_uuid: "",
      chat_file_location: "",
    },
    {
      id: 2,
      chat_summary:
        "Hello Mr. Sharma! Yes, the SkyGardens penthouses are specifically allotted 3 covered car parking slots. I can also arrange a site visit for this Thursday at 4 PM if you're available?",
      created_on: new Date().toISOString(),
      lead_uuid: "",
      chat_file_location: "",
    },
    {
      id: 3,
      chat_summary:
        "Thursday 4 PM works for me. Can you also bring the documentation regarding the RERA approval and land titles during the visit?",
      created_on: new Date().toISOString(),
      lead_uuid: "",
      chat_file_location: "",
    },
    {
      id: 4,
      chat_summary:
        "Absolutely. I'll have the complete folder ready. I'll send you the location pin for the site office right away.",
      created_on: new Date().toISOString(),
      lead_uuid: "",
      chat_file_location: "",
    }
  ];

  const tabTriggerClass = `
    w-full py-2 text-sm rounded-lg text-zinc-500 transition-all
    data-[state=active]:bg-white
    data-[state=active]:text-[#063669]
    data-[state=active]:shadow-sm
    data-[state=active]:font-semibold
  `;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(fromCustomer ? '/customers' : '/leads')}
          className="gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          <ArrowLeft className="h-4 w-4" />
          {fromCustomer ? 'Back to Customers' : 'Back to Leads Dashboard'}
        </Button>
      </div>

      {/* Header */}
      <PageHeader
        title={isLoading ? 'Loading...' : `Lead Information`}
        description={lead ? `Viewing details for ${lead.first_name || ''} ${lead.last_name || ''}` : ''}
      />

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <span className="text-zinc-500 animate-pulse">Fetching lead details...</span>
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-red-500">
          <p>Failed to load lead details.</p>
          <p className="text-sm text-zinc-500 mt-2">
            {(error as any)?.data?.message || 'Check connection or lead existence.'}
          </p>
        </div>
      )}

      {/* MAIN CARD */}
      {lead && (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl overflow-hidden">

          {/* Header */}
          <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-wrap gap-4 items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <User className="h-5 w-5 text-indigo-500" />
                {lead.first_name || ''} {lead.last_name || ''}
              </h3>
              <p className="text-sm font-medium text-zinc-500 mt-1">
                Lead ID:{' '}
                <span className="text-indigo-600 dark:text-indigo-400 font-mono bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded">
                  {fallback(lead.lead_id)}
                </span>
              </p>
            </div>
          </div>

          {/* BODY */}
          <div className="p-6">

            {/* GENERAL DETAILS */}
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4 uppercase tracking-wider">
              General Details
            </h4>

            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">

              <div className="space-y-1">
                <dt className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5"/> Creation Date
                </dt>
                <dd className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {formatDate(lead.created_on)}
                </dd>
              </div>

              <div className="space-y-1">
                <dt className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5"/> Lead Status
                </dt>
                <dd className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {getStatusLabel(lead.lead_status_id)}
                </dd>
              </div>

              <div className="space-y-1">
                <dt className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5"/> Customer Status
                </dt>
                <dd className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {getCustomerStatusLabel(lead.customer_status_id)}
                </dd>
              </div>

              <div className="space-y-1">
                <dt className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5"/> Project
                </dt>
                <dd className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {getProjectLabel(lead.project_id)}
                </dd>
              </div>

              <div className="space-y-1">
                <dt className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5"/> Source
                </dt>
                <dd className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {getSourceLabel(lead.source_id)}
                </dd>
              </div>

              {isInternalEmployeeSource && (
                <div className="space-y-1">
                  <dt className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5"/> Source Employee
                  </dt>
                  <dd className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {getSourceEmployeeName()}
                  </dd>
                </div>
              )}

              <div className="space-y-1">
                <dt className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5"/> Assigned RM
                </dt>
                <dd className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {getRmLabel(lead.assigned_to_rm)}
                </dd>
              </div>

              <div className="space-y-1">
                <dt className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5"/> Assigned EM
                </dt>
                <dd className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {getEmLabel(lead.assigned_to_em)}
                </dd>
              </div>

              <div className="space-y-1">
                <dt className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5"/> Occupation
                </dt>
                <dd className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {fallback(lead.occupation)}
                </dd>
              </div>

              <div className="space-y-1">
                <dt className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5"/> Phone Number
                </dt>
                <dd className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {fallback(lead.phone_number)}
                </dd>
              </div>

              <div className="space-y-1">
                <dt className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5"/> Email Address
                </dt>
                <dd className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {fallback(lead.email_address)}
                </dd>
              </div>

            </dl>

            {/* ADDRESS */}
            <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4 uppercase tracking-wider">
                Address Details
              </h4>

              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">

                <div className="space-y-1 md:col-span-2">
                  <dt className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5"/> Address
                  </dt>
                  <dd className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {fallback(lead.address)}
                  </dd>
                </div>

                <div className="space-y-1">
                  <dt className="text-[11px] font-semibold text-zinc-400 uppercase">City</dt>
                  <dd className="text-sm font-medium">{fallback(lead.city)}</dd>
                </div>

                <div className="space-y-1">
                  <dt className="text-[11px] font-semibold text-zinc-400 uppercase">State</dt>
                  <dd className="text-sm font-medium">{fallback(lead.state)}</dd>
                </div>

                <div className="space-y-1">
                  <dt className="text-[11px] font-semibold text-zinc-400 uppercase">Country</dt>
                  <dd className="text-sm font-medium">{fallback(lead.country)}</dd>
                </div>

                <div className="space-y-1">
                  <dt className="text-[11px] font-semibold text-zinc-400 uppercase">Zip Code</dt>
                  <dd className="text-sm font-medium">{fallback(lead.zip)}</dd>
                </div>

              </dl>
            </div>
          </div>
        </div>
      )}

      {/* TABS */}
      <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
        <Tabs defaultValue="activity" className="w-full flex flex-col gap-6">

          <div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl p-1">
            <TabsList className="w-full grid grid-cols-4 bg-transparent p-0 gap-1">

              <TabsTrigger value="activity" className={tabTriggerClass}>
                Activity
              </TabsTrigger>

              <TabsTrigger value="calls" className={tabTriggerClass}>
                Calls
              </TabsTrigger>

              <TabsTrigger value="chats" className={tabTriggerClass}>
                Chats
              </TabsTrigger>

              <TabsTrigger value="visits" className={tabTriggerClass}>
                Visits
              </TabsTrigger>

            </TabsList>
          </div>

          <TabsContent value="activity">
            <LeadRemarksTab remarks={lead?.remarks} />
          </TabsContent>

          <TabsContent value="calls">
            <LeadCallsTab
              calls={
                lead?.calls && lead.calls.length > 0
                  ? lead.calls
                  : ([
                      {
                        id: 1,
                        from_number: "9876543210",
                        to_number: "9123456780",
                        call_duration_in_seconds: 272,
                        created_on: new Date().toISOString(),
                        call_summary:
                          "Customer expressed interest in the 3BHK layout at Emerald Heights. They requested a floor plan and inquired about the early bird discount. Agent Vikram confirmed site availability for next Sunday and mentioned that follow-up is required for sharing sample flat photos.",
                        lead_uuid: "",
                        call_recording_location: "",
                        call_remarks: "",
                        caller_user_id: 0
                      },
                      {
                        id: 2,
                        from_number: "9123456780",
                        to_number: "9876543210",
                        call_duration_in_seconds: 135,
                        created_on: new Date().toISOString(),
                        call_summary:
                          "Customer called back to verify the RERA number shared earlier. They also asked about the possession timeline and phase 1 completion status. The customer showed positive interest but had concerns regarding bank loan tie-ups and requested clarification during the site visit.",
                        lead_uuid: "",
                        call_recording_location: "",
                        call_remarks: "",
                        caller_user_id: 0
                      }
                    ] as any)
              }
            />
          </TabsContent>

          <TabsContent value="chats">
            <LeadChatsTab chats={lead?.chats?.length ? lead.chats : dummyChats} />
          </TabsContent>

          <TabsContent value="visits">
            <LeadVisitsTab
              visits={lead?.visits}
              lead={lead}
              siteVisitStatuses={masterData?.site_visit_status || []}
              getSiteVisitStatusLabel={(id) =>
                masterData?.site_visit_status?.find((s: any) => s.id === id)?.description || String(id)
              }
            />
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
};