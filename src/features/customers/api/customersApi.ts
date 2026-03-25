import { baseApi } from '../../../app/api/baseApi';
import type { 
  Customer, 
  GetCustomersRequest, 
  GetCustomersResponse 
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
  }),
});

export const { 
  useGetCustomersQuery,
} = customersApi;
