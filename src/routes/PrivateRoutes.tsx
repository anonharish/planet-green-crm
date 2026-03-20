import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';

const DashboardPage = React.lazy(() => import('../features/dashboard/pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const LeadsPage = React.lazy(() => import('../features/leads/pages/LeadsPage').then(m => ({ default: m.LeadsPage })));
const UsersPage = React.lazy(() => import('../features/users/pages/UsersPage').then(m => ({ default: m.UsersPage })));
const AgentsPage = React.lazy(() => import('../features/agents/pages/AgentsPage').then(m => ({ default: m.AgentsPage })));

export const PrivateRoutes = (
  <Route element={<MainLayout />}>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/leads" element={<LeadsPage />} />
    <Route path="/users" element={<UsersPage />} />
    <Route path="/agents" element={<AgentsPage />} />
  </Route>
);
