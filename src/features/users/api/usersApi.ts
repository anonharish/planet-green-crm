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
    updateUser: builder.mutation<CreateUserResponse, Partial<CreateUserRequest> & { id: number }>({
      query: ({ id, ...body }) => ({
        url: `/users/updateUser/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Users'],
    }),
    deleteUser: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/users/deleteUser/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
    }),
  }),
});

export const { 
  useGetUsersQuery,
  useGetAllUsersByRoleIdQuery,
  useCreateUserMutation, 
  useUpdateUserMutation, 
  useDeleteUserMutation 
} = usersApi;
