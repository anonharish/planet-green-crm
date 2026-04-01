import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AuthLayout = () => {
  const { isAuthenticated, isFirstLogin } = useAuth();

  if (isAuthenticated && isFirstLogin) {
    return <Navigate to="/set-password" replace />;
  }

  if (isAuthenticated && !isFirstLogin) {
    return <Navigate to="/leads" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 px-4">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
};
