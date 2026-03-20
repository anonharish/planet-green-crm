import { baseApi } from '../../../app/api/baseApi';
import type { LoginRequest, LoginResponse, UpdatePasswordRequest, UpdatePasswordResponse, Role, GetUserRolesRequest } from '../types/index';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    updatePassword: builder.mutation<UpdatePasswordResponse, UpdatePasswordRequest>({
      query: (body) => ({
        url: '/auth/updatePassword',
        method: 'POST',
        body,
      }),
    }),
    getUserRoles: builder.mutation<Role[], GetUserRolesRequest>({
      query: (body) => ({
        url: '/users/getUserRoles',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useLoginMutation, useUpdatePasswordMutation, useGetUserRolesMutation } = authApi;
