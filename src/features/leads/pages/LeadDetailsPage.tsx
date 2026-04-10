import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin, Calendar, Info, Pencil } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { useGetLeadByIdQuery } from '../api/leadsApi';
import { formatDate } from '../../../utils';
import { useMasterDataLookup } from '../../../shared/hooks/useMasterDataLookup';
import { useGetAllUsersQuery } from '../../users/api/usersApi';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { LeadRemarksTab } from '../components/tabs/LeadRemarksTab';
import { LeadCallsTab } from '../components/tabs/LeadCallsTab';
import { LeadVisitsTab } from '../components/tabs/LeadVisitsTab';
import { LeadChatsTab } from '../components/tabs/LeadChatsTab';

/* ── Reusable label style (Figma: Inter 600 11px uppercase #64748B) ── */
const labelStyle: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontWeight: 600,
  fontSize: '11px',
  lineHeight: '16.5px',
  letterSpacing: '0.55px',
  textTransform: 'uppercase' as const,
  color: '#64748B',
};

/* ── Reusable value style (Figma: Inter 600 14px #191C1E) ── */
const valueStyle: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontWeight: 600,
  fontSize: '14px',
  lineHeight: '20px',
  letterSpacing: '0px',
  color: '#191C1E',
};

/* ── Field component ── */
const DetailField = ({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) => (
  <div className="space-y-2">
    <dt style={labelStyle} className="flex items-center gap-1.5">
      {label}
    </dt>
    <dd style={valueStyle} className="flex items-center gap-2">
      {icon}
      {value || <span style={{ color: '#94A3B8' }}>--</span>}
    </dd>
  </div>
);

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

  const { data: users = [] } = useGetAllUsersQuery({ offset: 0 });

  const getSourceEmployeeName = () => {
    if (!lead?.source_employee_user_id) return '--';
    const user = users.find(u => u.id === lead.source_employee_user_id);
    return user ? `${user.first_name} ${user.last_name}` : `ID: ${lead.source_employee_user_id}`;
  };

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

  /* ── Avatar initials ── */
  const initials = `${(lead?.first_name || '')[0] || ''}${(lead?.last_name || '')[0] || ''}`.toUpperCase() || '?';

  return (
    <div className="space-y-6 pb-12">
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

      {lead && (
        <>
          {/* ═══════════════════════════════════════════════ */}
          {/* CARD 1: Name, Lead ID, Added Date              */}
          {/* ═══════════════════════════════════════════════ */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-8 py-6 flex items-center gap-5">
            {/* Avatar */}
            <div
              className="shrink-0 flex items-center justify-center rounded-2xl text-white font-bold text-2xl"
              style={{ width: 56, height: 56, backgroundColor: '#0f3d6b' }}
            >
              {initials}
            </div>

            {/* Name + meta */}
            <div>
              <h2
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '22px', lineHeight: '28px', color: '#191C1E' }}
              >
                {lead.first_name || ''} {lead.last_name || ''}
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '13px', color: '#64748B' }}>
                  Lead ID:{' '}
                  <span style={{ fontWeight: 700, color: '#0f3d6b' }}>
                    PG{lead.lead_id}
                  </span>
                </span>
                <span style={{ color: '#CBD5E1' }}>·</span>
                <span className="flex items-center gap-1.5" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '13px', color: '#64748B' }}>
                  <Calendar className="h-3.5 w-3.5" />
                  Added: {formatDate(lead.created_on)}
                </span>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════ */}
          {/* CARD 2: General Details                         */}
          {/* ═══════════════════════════════════════════════ */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
            {/* Section heading */}
            <div className="flex items-center justify-between px-8 pt-7 pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#EFF6FF] flex items-center justify-center">
                  <Info className="h-4 w-4 text-[#0f3d6b]" />
                </div>
                <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '18px', lineHeight: '24px', color: '#191C1E' }}>
                  General Details
                </h3>
              </div>
              <button className="w-8 h-8 rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-50 transition-colors">
                <Pencil className="h-4 w-4 text-zinc-500" />
              </button>
            </div>

            {/* Fields */}
            <dl className="grid grid-cols-2 gap-x-16 gap-y-7 px-8 py-7">
              <DetailField label="Creation Date" value={formatDate(lead.created_on)} />
              <DetailField
                label="Lead Status"
                value={
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    {getStatusLabel(lead.lead_status_id)}
                  </span>
                }
              />
              <DetailField label="Customer Status" value={getCustomerStatusLabel(lead.customer_status_id)} />
              <DetailField label="Project" value={getProjectLabel(lead.project_id)} />
              <DetailField
                label="Source"
                value={getSourceLabel(lead.source_id)}
              />
              <DetailField
                label="Assigned RM"
                value={
                  lead.assigned_to_rm ? (
                    <span className="flex items-center gap-2">
                      <span
                        className="w-6 h-6 rounded-full bg-[#0f3d6b] text-white flex items-center justify-center text-[9px] font-bold shrink-0"
                      >
                        {getRmLabel(lead.assigned_to_rm).split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                      {getRmLabel(lead.assigned_to_rm)}
                    </span>
                  ) : null
                }
              />
              {isInternalEmployeeSource && (
                <DetailField label="Source Employee" value={getSourceEmployeeName()} />
              )}
              <DetailField label="Assigned EM" value={getEmLabel(lead.assigned_to_em) === '--' ? 'Not Assigned' : getEmLabel(lead.assigned_to_em)} />
              <DetailField label="Occupation" value={lead.occupation} />
              <DetailField
                label="Phone Number"
                value={lead.phone_number}
                icon={<Phone className="h-4 w-4 text-[#0f3d6b]" />}
              />
              <DetailField
                label="Email Address"
                value={lead.email_address}
                icon={<Mail className="h-4 w-4 text-[#64748B]" />}
              />
            </dl>
          </div>

          {/* ═══════════════════════════════════════════════ */}
          {/* CARD 3: Address Details                         */}
          {/* ═══════════════════════════════════════════════ */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
            {/* Section heading */}
            <div className="flex items-center gap-2.5 px-8 pt-7 pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="w-7 h-7 rounded-full bg-[#EFF6FF] flex items-center justify-center">
                <MapPin className="h-4 w-4 text-[#0f3d6b]" />
              </div>
              <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '18px', lineHeight: '24px', color: '#191C1E' }}>
                Address Details
              </h3>
            </div>

            {/* Fields */}
            <dl className="grid grid-cols-2 gap-x-16 gap-y-7 px-8 py-7">
              <DetailField label="State" value={lead.state} />
              <DetailField label="Country" value={lead.country} />
              <DetailField label="City" value={lead.city} />
              <DetailField label="Zip Code" value={lead.zip} />
              <DetailField label="Street" value={lead.address} />
            </dl>
          </div>

          {/* ═══════════════════════════════════════════════ */}
          {/* CARD 4: Activity / Calls / Chats / Visits       */}
          {/* ═══════════════════════════════════════════════ */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
            <Tabs defaultValue="activity" className="w-full flex flex-col">
              {/* Tab triggers */}
              <div className="border-b border-zinc-200 dark:border-zinc-800">
                <TabsList className="w-full bg-transparent p-0 h-auto rounded-none grid grid-cols-4">
                  {['activity', 'calls', 'chats', 'visits'].map((tab) => (
                    <TabsTrigger
                      key={tab}
                      value={tab}
                      className="
                        py-4 text-sm font-medium capitalize rounded-none border-b-2 border-transparent
                        text-zinc-400
                        data-[state=active]:text-[#0f3d6b]
                        data-[state=active]:border-b-[#0f3d6b]
                        data-[state=active]:font-semibold
                        data-[state=active]:shadow-none
                        transition-all
                      "
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* Tab content */}
              <div className="p-6">
                <TabsContent value="activity" className="mt-0">
                  <LeadRemarksTab remarks={lead?.remarks} />
                </TabsContent>

                <TabsContent value="calls" className="mt-0">
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
                                "Customer expressed interest in the 3BHK layout at Emerald Heights. They requested a floor plan and inquired about the early bird discount.",
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
                                "Customer called back to verify the RERA number shared earlier. They also asked about the possession timeline.",
                              lead_uuid: "",
                              call_recording_location: "",
                              call_remarks: "",
                              caller_user_id: 0
                            }
                          ] as any)
                    }
                  />
                </TabsContent>

                <TabsContent value="chats" className="mt-0">
                  <LeadChatsTab chats={lead?.chats?.length ? lead.chats : dummyChats} />
                </TabsContent>

                <TabsContent value="visits" className="mt-0">
                  <LeadVisitsTab
                    visits={lead?.visits}
                    lead={lead}
                    siteVisitStatuses={masterData?.site_visit_status || []}
                    getSiteVisitStatusLabel={(id) =>
                      masterData?.site_visit_status?.find((s: any) => s.id === id)?.description || String(id)
                    }
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </>
      )}
    </div>
  );
};