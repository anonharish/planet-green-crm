import React from 'react';

export const DashboardPage = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <h2 className="text-sm font-medium tracking-tight text-zinc-500">Total Leads</h2>
          <p className="text-3xl font-bold mt-2">1,234</p>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <h2 className="text-sm font-medium tracking-tight text-zinc-500">Active Agents</h2>
          <p className="text-3xl font-bold mt-2">43</p>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <h2 className="text-sm font-medium tracking-tight text-zinc-500">New Users</h2>
          <p className="text-3xl font-bold mt-2">12</p>
        </div>
      </div>
    </div>
  );
};
