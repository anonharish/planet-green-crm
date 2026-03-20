import React, { Suspense } from 'react';
import { Routes, BrowserRouter, Route } from 'react-router-dom';
import { PublicRoutes } from './PublicRoutes';
import { PrivateRoutes } from './PrivateRoutes';
import { SetPasswordLayout } from '../layouts/SetPasswordLayout';

const SetPasswordPage = React.lazy(() => import('../features/auth/pages/SetPasswordPage').then(m => ({ default: m.SetPasswordPage })));

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="flex h-screen items-center justify-center text-zinc-500">Loading...</div>}>
        <Routes>
          {PublicRoutes}
          {PrivateRoutes}
          <Route element={<SetPasswordLayout />}>
            <Route path="/set-password" element={<SetPasswordPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};
