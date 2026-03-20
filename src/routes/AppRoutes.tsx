import React, { Suspense } from 'react';
import { Routes, BrowserRouter } from 'react-router-dom';
import { PublicRoutes } from './PublicRoutes';
import { PrivateRoutes } from './PrivateRoutes';

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="flex h-screen items-center justify-center text-zinc-500">Loading...</div>}>
        <Routes>
          {PublicRoutes}
          {PrivateRoutes}
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};
