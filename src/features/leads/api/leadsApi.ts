import { baseApi } from '../../../app/api/baseApi';
import type { 
  Lead, 
  CreateLeadRequest, 
  GetLeadsRequest, 
  GetLeadsResponse 
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
    createLead: builder.mutation<{ message: string }, CreateLeadRequest>({
      query: (body) => ({
        url: '/leads/createLead',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Leads'],
    }),
    updateLead: builder.mutation<{ message: string }, Partial<CreateLeadRequest> & { uuid: string }>({
      query: (body) => ({
        url: '/leads/updateLead',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Leads'],
    }),
  }),
});

export const { 
  useGetLeadsQuery,
  useCreateLeadMutation,
  useUpdateLeadMutation,
} = leadsApi;
