import { baseApi } from '../../../app/api/baseApi';
import type { 
  Customer, 
  GetCustomersRequest, 
  GetCustomersResponse,
  UpdateCustomerRequest
} from '../types';

export const customersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCustomers: builder.query<GetCustomersResponse, GetCustomersRequest>({
      query: (body) => ({
        url: '/customers/getCustomers',
        method: 'POST',
        body,
      }),
      providesTags: ['Customers'],
    }),
    updateCustomer: builder.mutation<{ message: string }, UpdateCustomerRequest>({
      query: (body) => ({
        url: '/customers/updateCustomer',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Customers'],
    }),
  }),
});

export const { 
  useGetCustomersQuery,
  useUpdateCustomerMutation,
} = customersApi;
