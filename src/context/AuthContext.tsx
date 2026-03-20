import React, { createContext, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import { setCredentials, logoutUser, setPasswordSuccess } from '../features/auth/store/authSlice';

interface AuthContextType {
  isAuthenticated: boolean;
  isFirstLogin: boolean;
  user: { id: string; email: string; name: string; role_id: number } | null;
  login: (token: string, refreshToken: string, isFirstLogin: boolean, user: { id: string; email: string; name: string; role_id: number }) => void;
  logout: () => void;
  completePasswordSetup: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, isFirstLogin, user } = useSelector((state: RootState) => state.auth);

  const login = (token: string, refreshToken: string, isFirstLevel: boolean, userData: { id: string; email: string; name: string; role_id: number }) => {
    dispatch(setCredentials({ user: userData, token, refreshToken, isFirstLogin: isFirstLevel }));
  };

  const logout = () => {
    dispatch(logoutUser());
  };

  const completePasswordSetup = () => {
    dispatch(setPasswordSuccess());
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isFirstLogin, user, login, logout, completePasswordSetup }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
