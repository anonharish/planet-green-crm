import { baseApi } from '../../../app/api/baseApi';
import type { 
  Lead, 
  CreateLeadRequest, 
  UpdateLeadRequest,
  GetLeadsRequest, 
  GetLeadsResponse,
  GetLeadByIdRequest,
  ScheduleVisitRequest,
  GetCustomerLeadsRequest,
  GetLeadsByRmIdRequest,
  GetLeadsByEmIdRequest,
  AddLeadActivityRequest
} from '../types';

export const leadsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLeads: builder.query<GetLeadsResponse, GetLeadsRequest>({
      query: (body) => ({
        url: '/leads/getLeads',
        method: 'POST',
        body,
      }),
      providesTags: ['Leads'],
    }),
    getLeadById: builder.query<Lead, GetLeadByIdRequest>({
      query: (body) => ({
        url: '/leads/getLeadById',
        method: 'POST',
        body,
      }),
      providesTags: (result, error, arg) => [{ type: 'Leads', id: arg.uuid }],
    }),
    getLeadsByCustomerUuid: builder.query<GetLeadsResponse, GetCustomerLeadsRequest>({
      query: (body) => ({
        url: '/leads/getLeadsByCustomerUuid',
        method: 'POST',
        body,
      }),
      providesTags: ['Leads'],
    }),
    getLeadsByRmId: builder.query<GetLeadsResponse, GetLeadsByRmIdRequest>({
      query: (body) => ({
        url: '/leads/getLeadsByRmId',
        method: 'POST',
        body,
      }),
      providesTags: ['Leads'],
    }),
    getLeadsByEmId: builder.query<GetLeadsResponse, GetLeadsByEmIdRequest>({
      query: (body) => ({
        url: '/leads/getLeadsByEmId',
        method: 'POST',
        body,
      }),
      providesTags: ['Leads'],
    }),
    createLead: builder.mutation<{ message: string }, CreateLeadRequest>({
      query: (body) => ({
        url: '/leads/createLead',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Leads'],
    }),
    updateLead: builder.mutation<{ message: string }, UpdateLeadRequest>({
      query: (body) => ({
        url: '/leads/updateLead',
        method: 'POST',
        body,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
        try {
          await queryFulfilled;
          const state = getState() as { baseApi?: { queries?: Record<string, any> } };
          const queries = state.baseApi?.queries || {};
          
          for (const key of Object.keys(queries)) {
            if (key.startsWith('getLeads(')) {
              dispatch(
                leadsApi.util.updateQueryData('getLeads', queries[key].originalArgs, (draft) => {
                  const index = draft.findIndex(l => l.uuid === arg.uuid);
                  if (index !== -1) Object.assign(draft[index], arg);
                })
              );
            }
            if (key.startsWith('getLeadsByCustomerUuid(')) {
              dispatch(
                leadsApi.util.updateQueryData('getLeadsByCustomerUuid', queries[key].originalArgs, (draft) => {
                  const index = draft.findIndex(l => l.uuid === arg.uuid);
                  if (index !== -1) Object.assign(draft[index], arg);
                })
              );
            }
            if (key.startsWith('getLeadById(')) {
              dispatch(
                leadsApi.util.updateQueryData('getLeadById', queries[key].originalArgs, (draft) => {
                  if (draft.uuid === arg.uuid) Object.assign(draft, arg);
                })
              );
            }
          }
        } catch {
          // If the mutation fails, we don't apply the optimistic update anyway
        }
      },
    }),
    bulkAssignLeadsToRm: builder.mutation<{ message: string; affectedRows: number }, { lead_uuids: string[]; assigned_to_rm: number }>({
      query: (body) => ({
        url: '/leads/bulkAssignLeadsToRm',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Leads'],
    }),
    bulkAssignLeadsToEm: builder.mutation<{ message: string; affectedRows: number }, { lead_uuids: string[]; assigned_to_em: number }>({
      query: (body) => ({
        url: '/leads/bulkAssignLeadsToEm',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Leads'],
    }),
    deleteLead: builder.mutation<{ message: string }, { uuid: string }>({
      query: (body) => ({
        url: '/leads/deleteLead',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Leads'],
    }),
    scheduleVisit: builder.mutation<{ message: string }, ScheduleVisitRequest>({
      query: (body) => ({
        url: '/leadSiteVisits/createSiteVisit',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Leads'],
    }),
    addLeadActivity: builder.mutation<{ message: string }, AddLeadActivityRequest>({
      query: (body) => ({
        url: '/leads/addLeadActivity',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Leads'],
    }),
  }),
});

export const { 
  useGetLeadsQuery,
  useGetLeadByIdQuery,
  useCreateLeadMutation,
  useUpdateLeadMutation,
  useBulkAssignLeadsToRmMutation,
  useBulkAssignLeadsToEmMutation,
  useDeleteLeadMutation,
  useScheduleVisitMutation,
  useGetLeadsByCustomerUuidQuery,
  useGetLeadsByRmIdQuery,
  useGetLeadsByEmIdQuery,
  useAddLeadActivityMutation,
} = leadsApi;
