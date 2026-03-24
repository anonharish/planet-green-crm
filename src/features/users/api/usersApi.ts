import { baseApi } from '../../../app/api/baseApi';
import type { 
  CreateUserRequest, 
  CreateUserResponse, 
  GetUsersRequest, 
  GetUsersResponse,
  User 
} from '../types';

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllUsersByRoleId: builder.query<User[], { role_id: number; offset: number }>({
      query: (body) => ({
        url: '/users/getAllUsersByRoleId',
        method: 'POST',
        body,
      }),
      providesTags: ['Users'],
    }),
    getUsers: builder.query<GetUsersResponse, GetUsersRequest>({
      query: (params) => ({
        url: '/users/getUsers',
        method: 'GET',
        params,
      }),
      providesTags: ['Users'],
    }),
    createUser: builder.mutation<CreateUserResponse, CreateUserRequest>({
      query: (body) => ({
        url: '/users/createUser',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Users'],
    }),
    updateUser: builder.mutation<{ message: string }, Partial<CreateUserRequest> & { id: number }>({
      query: (body) => ({
        url: '/users/updateUser',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Users'],
    }),
    deleteUser: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: '/users/deleteUser',
        method: 'POST',
        body: { id },
      }),
      invalidatesTags: ['Users'],
    }),
    getReportees: builder.query<User[], { reporting_manager_id: number; offset: number }>({
      query: (body) => ({
        url: '/users/getReportees',
        method: 'POST',
        body,
      }),
      providesTags: ['Users'],
    }),
  }),
});

export const { 
  useGetUsersQuery,
  useGetAllUsersByRoleIdQuery,
  useCreateUserMutation, 
  useUpdateUserMutation, 
  useDeleteUserMutation,
  useGetReporteesQuery,
} = usersApi;
