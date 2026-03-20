import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: { id: string; email: string; name: string } | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isFirstLogin: boolean;
}

const getStoredItem = (key: string) => localStorage.getItem(key);

const initialState: AuthState = {
  user: getStoredItem('user') ? JSON.parse(getStoredItem('user')!) : null,
  token: getStoredItem('token'),
  refreshToken: getStoredItem('refreshToken'),
  isAuthenticated: !!getStoredItem('token'),
  isFirstLogin: getStoredItem('isFirstLogin') === 'true',
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

      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('isFirstLogin');
    },
  },
});

export const { setCredentials, setPasswordSuccess, logoutUser } = authSlice.actions;
export default authSlice.reducer;
