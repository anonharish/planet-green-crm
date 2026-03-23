import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';

const DashboardPage = React.lazy(() => import('../features/dashboard/pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const LeadsPage = React.lazy(() => import('../features/leads/pages/LeadsPage').then(m => ({ default: m.LeadsPage })));
const RelationshipManagersPage = React.lazy(() => import('../features/relationship-managers/pages/RelationshipManagersPage').then(m => ({ default: m.RelationshipManagersPage })));
const AgentsPage = React.lazy(() => import('../features/agents/pages/AgentsPage').then(m => ({ default: m.AgentsPage })));
const PlaygroundPage = React.lazy(() => import('../features/playground/pages/PlaygroundPage').then(m => ({ default: m.PlaygroundPage })));

export const PrivateRoutes = (
  <Route element={<MainLayout />}>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/leads" element={<LeadsPage />} />
    <Route path="/relationship-managers" element={<RelationshipManagersPage />} />
    <Route path="/agents" element={<AgentsPage />} />
    <Route path="/playground" element={<PlaygroundPage />} />
  </Route>
);
