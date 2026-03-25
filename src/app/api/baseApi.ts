import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { logoutUser, setCredentials } from '../../features/auth/store/authSlice';
import { Mutex } from 'async-mutex';

// Create a new mutex
const mutex = new Mutex();

const baseQuery = fetchBaseQuery({
  // baseUrl: 'http://localhost:3000',
  baseUrl: 'https://y7lidobvl7.execute-api.ap-south-1.amazonaws.com',
  prepareHeaders: (headers, { getState }) => {
    // We can get the token from Redux state instead of localStorage directly
    const token = (getState() as any).auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  // Wait until the mutex is available without locking it
  await mutex.waitForUnlock();
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Checking whether the mutex is locked
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const refreshToken = (api.getState() as any).auth.refreshToken;
        
        if (refreshToken) {
          const refreshResult = await baseQuery(
            { url: '/auth/refreshToken', method: 'POST', body: { token: refreshToken } },
            api,
            extraOptions
          );

          if (refreshResult.data) {
            const data = refreshResult.data as any;
            
            // Store the new tokens
            api.dispatch(
              setCredentials({
                user: (api.getState() as any).auth.user,
                token: data.token,
                refreshToken: data.refreshToken || refreshToken,
                isFirstLogin: (api.getState() as any).auth.isFirstLogin,
              })
            );

            // Retry the initial query
            result = await baseQuery(args, api, extraOptions);
          } else {
            api.dispatch(logoutUser());
          }
        } else {
          api.dispatch(logoutUser());
        }
      } finally {
        release();
      }
    } else {
      // Wait until the mutex is available without locking it
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }
  return result;
};

import { createApi } from '@reduxjs/toolkit/query/react';

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Users', 'Leads', 'Customers', 'Master'],
  endpoints: () => ({}),
});
