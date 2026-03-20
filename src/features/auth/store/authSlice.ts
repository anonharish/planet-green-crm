import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Role } from '../types';

interface AuthState {
  user: { id: string; email: string; name: string; role_id: number } | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isFirstLogin: boolean;
  roles: Role[];
  currentRole: Role | null;
}

const getStoredItem = (key: string) => localStorage.getItem(key);

const initialState: AuthState = {
  user: getStoredItem('user') ? JSON.parse(getStoredItem('user')!) : null,
  token: getStoredItem('token'),
  refreshToken: getStoredItem('refreshToken'),
  isAuthenticated: !!getStoredItem('token'),
  isFirstLogin: getStoredItem('isFirstLogin') === 'true',
  roles: [],
  currentRole: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: AuthState['user']; token: string; refreshToken: string; isFirstLogin: boolean }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isFirstLogin = action.payload.isFirstLogin;
      state.isAuthenticated = true;

      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
      localStorage.setItem('isFirstLogin', String(action.payload.isFirstLogin));
    },
    setRoles: (state, action: PayloadAction<Role[]>) => {
      state.roles = action.payload;
      if (state.user) {
        state.currentRole = action.payload.find((r) => r.id === state.user!.role_id) ?? null;
      }
    },
    setPasswordSuccess: (state) => {
      state.isFirstLogin = false;
      localStorage.setItem('isFirstLogin', 'false');
    },
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isFirstLogin = false;
      state.roles = [];
      state.currentRole = null;

      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('isFirstLogin');
    },
  },
});

export const { setCredentials, setRoles, setPasswordSuccess, logoutUser } = authSlice.actions;
export default authSlice.reducer;
