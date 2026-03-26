import { baseApi } from '../../../app/api/baseApi';
import type { 
  Lead, 
  CreateLeadRequest, 
  UpdateLeadRequest,
  GetLeadsRequest, 
  GetLeadsResponse,
  GetLeadByIdRequest
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
      invalidatesTags: ['Leads'],
    }),
    bulkAssignLeadsToRm: builder.mutation<{ message: string; affectedRows: number }, { lead_uuids: string[]; assigned_to_rm: number }>({
      query: (body) => ({
        url: '/leads/bulkAssignLeadsToRm',
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
  }),
});

export const { 
  useGetLeadsQuery,
  useGetLeadByIdQuery,
  useCreateLeadMutation,
  useUpdateLeadMutation,
  useBulkAssignLeadsToRmMutation,
  useDeleteLeadMutation,
} = leadsApi;
