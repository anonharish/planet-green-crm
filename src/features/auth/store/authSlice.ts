import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { storage } from '../../../shared/utils/localStorage';

export interface User {
  id: string;
  email: string;
  name: string;
  role_id: number;
}

export interface Role {
  id: number;
  code: string;
  description: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isFirstLogin: boolean;
  roles: Role[];
  currentRole: Role | null;
}

// Keys for localStorage
const STORAGE_KEYS = {
  USER: 'crm_user',
  TOKEN: 'crm_token',
  REFRESH_TOKEN: 'crm_refresh_token',
  ROLES: 'crm_roles',
  CURRENT_ROLE: 'crm_current_role',
};

const initialState: AuthState = {
  user: storage.get(STORAGE_KEYS.USER, null),
  token: storage.get(STORAGE_KEYS.TOKEN, null),
  refreshToken: storage.get(STORAGE_KEYS.REFRESH_TOKEN, null),
  roles: storage.get(STORAGE_KEYS.ROLES, []),
  currentRole: storage.get(STORAGE_KEYS.CURRENT_ROLE, null),
  isAuthenticated: !!storage.get(STORAGE_KEYS.TOKEN, null),
  isFirstLogin: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string; refreshToken: string; isFirstLogin?: boolean }>
    ) => {
      const { user, token, refreshToken, isFirstLogin } = action.payload;
      state.user = user;
      state.token = token;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      state.isFirstLogin = !!isFirstLogin;

      storage.set(STORAGE_KEYS.USER, user);
      storage.set(STORAGE_KEYS.TOKEN, token);
      storage.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    },
    setRoles: (state, action: PayloadAction<Role[]>) => {
      state.roles = action.payload;
      storage.set(STORAGE_KEYS.ROLES, action.payload);

      if (action.payload.length > 0) {
        const matchingRole = action.payload.find(r => r.id === state.user?.role_id);
        const roleToSet = matchingRole || action.payload[0];
        
        state.currentRole = roleToSet;
        storage.set(STORAGE_KEYS.CURRENT_ROLE, roleToSet);
      }
    },
    setCurrentRole: (state, action: PayloadAction<Role>) => {
      state.currentRole = action.payload;
      storage.set(STORAGE_KEYS.CURRENT_ROLE, action.payload);
    },
    updateToken: (state, action: PayloadAction<{ token: string; refreshToken: string }>) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      storage.set(STORAGE_KEYS.TOKEN, action.payload.token);
      storage.set(STORAGE_KEYS.REFRESH_TOKEN, action.payload.refreshToken);
    },
    setPasswordSuccess: (state) => {
      state.isFirstLogin = false;
    },
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.roles = [];
      state.currentRole = null;
      state.isFirstLogin = false;

      // Clear ALL localStorage
      storage.clear();
    },
  },
});

export const { setCredentials, setRoles, setCurrentRole, updateToken, setPasswordSuccess, logoutUser } = authSlice.actions;
export default authSlice.reducer;
