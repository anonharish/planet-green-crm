import React, { useState } from 'react';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { StatusBadge } from '../../../shared/components/StatusBadge/StatusBadge';
import { FilterBar, SearchInput, DateRangeFilter } from '../../../shared/components/FilterBar/FilterBar';
import { DataTable, type ColumnDef } from '../../../shared/components/DataTable/DataTable';
import { AppDrawer } from '../../../shared/components/AppDrawer/AppDrawer';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog/ConfirmDialog';
import { Button } from '../../../components/ui/button';
import { Plus, Trash2, Edit } from 'lucide-react';

interface MockData {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
}

const MOCK_DATA: MockData[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', status: 'new', createdAt: '2024-03-20' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'interested', createdAt: '2024-03-19' },
  { id: '3', name: 'Robert Brown', email: 'robert@example.com', status: 'contacted', createdAt: '2024-03-18' },
  { id: '4', name: 'Emily Davis', email: 'emily@example.com', status: 'not_interested', createdAt: '2024-03-17' },
];

export const PlaygroundPage = () => {
  // State for Drawer and Dialog
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // State for Filters and Pagination
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const columns: ColumnDef<MockData>[] = [
    { key: 'name', header: 'Name', render: (row) => <span className="font-medium">{row.name}</span> },
    { key: 'email', header: 'Email', render: (row) => row.email },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'createdAt', header: 'Created At', render: (row) => row.createdAt },
    {
      key: 'actions',
      header: 'Actions',
      width: '100px',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => setIsDialogOpen(true)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 1. Page Header */}
      <PageHeader 
        title="UI Component Playground" 
        description="Preview and test the CRM shared component library."
        actions={
          <Button onClick={() => setIsDrawerOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Record
          </Button>
        }
      />

      {/* 2. Status Badges Preview */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Status Badges</h3>
        <div className="flex flex-wrap gap-2 p-4 border rounded-lg bg-zinc-50/50 dark:bg-zinc-900/50">
          <StatusBadge status="new" />
          <StatusBadge status="assigned" />
          <StatusBadge status="contacted" />
          <StatusBadge status="interested" />
          <StatusBadge status="not_interested" />
          <StatusBadge status="converted" />
          <StatusBadge status="unknown" />
        </div>
      </div>

      {/* 3. Filter Bar & Data Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Data Table & Filters</h3>
        <div className="border rounded-lg p-4 bg-white dark:bg-zinc-950 shadow-sm space-y-4">
          <FilterBar onReset={() => { setSearch(''); setFromDate(''); setToDate(''); }}>
            <SearchInput value={search} onChange={setSearch} placeholder="Search name or email..." />
            <DateRangeFilter 
              fromDate={fromDate} 
              toDate={toDate} 
              onFromChange={setFromDate} 
              onToChange={setToDate} 
            />
          </FilterBar>

          <DataTable
            columns={columns}
            data={MOCK_DATA}
            rowKey={(row) => row.id}
            page={page}
            limit={limit}
            total={100}
            onPageChange={setPage}
            onLimitChange={setLimit}
            isLoading={false}
          />
        </div>
      </div>

      {/* 4. App Drawer */}
      <AppDrawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Create New Record"
        description="Fill in the details below to add a new lead to the system."
      >
        <div className="space-y-4">
          <div className="p-12 border-2 border-dashed rounded-lg text-center text-zinc-400">
            Form contents will go here
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsDrawerOpen(false)}>Cancel</Button>
            <Button onClick={() => setIsDrawerOpen(false)}>Save Changes</Button>
          </div>
        </div>
      </AppDrawer>

      {/* 5. Confirm Dialog */}
      <ConfirmDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={() => setIsDialogOpen(false)}
        title="Delete Record"
        description="Are you sure you want to delete this record? This action is permanent and cannot be reversed."
      />
    </div>
  );
};
