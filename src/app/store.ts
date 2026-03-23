import { configureStore, combineReducers } from '@reduxjs/toolkit';
import type { AnyAction, Reducer } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { baseApi } from './api/baseApi';
import authReducer from '../features/auth/store/authSlice';

// 1. Combine all slice reducers
const appReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  auth: authReducer,
});

// 2. Define a root reducer to intercept logout
const rootReducer: Reducer = (state: ReturnType<typeof appReducer> | undefined, action: AnyAction) => {
  // If the action is logoutUser, reset the entire state to undefined.
  // This causes each individual reducer to return its initialState.
  if (action.type === 'auth/logoutUser') {
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};

// 3. Configure the store with the root reducer
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof appReducer>;
export type AppDispatch = typeof store.dispatch;
