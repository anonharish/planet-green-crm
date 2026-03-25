import React, { useState } from 'react';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { FilterBar, SearchInput } from '../../../shared/components/FilterBar/FilterBar';
import { CustomerTable } from '../components/CustomerTable';
import { useGetCustomersQuery } from '../api/customersApi';
import type { Customer } from '../types';

export const CustomersPage = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(200); // Fixed at 200 per user request
  const [search, setSearch] = useState('');
  
  // Sorting state
  const [sortField, setSortField] = useState<string>('created_on');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data: customers = [], isLoading, isFetching } = useGetCustomersQuery({ 
    offset: (page - 1) * limit 
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Search, Filter and Sort locally
  const sortedAndFilteredData = React.useMemo(() => {
    let result = [...customers];
    
    // Search Filtering
    if (search) {
      const query = search.toLowerCase();
      result = result.filter(item => {
        const fullName = `${item.first_name || ''} ${item.last_name || ''}`.toLowerCase();
        return (
          fullName.includes(query) || 
          item.email_address?.toLowerCase().includes(query) ||
          item.phone_number?.includes(query)
        );
      });
    }

    // Sorting Logic
    result.sort((a, b) => {
      let valA: any = (a as any)[sortField];
      let valB: any = (b as any)[sortField];

      if (sortField === 'created_on') {
        valA = a.created_on ? new Date(a.created_on).getTime() : 0;
        valB = b.created_on ? new Date(b.created_on).getTime() : 0;
      } else {
        valA = typeof valA === 'string' ? valA.toLowerCase() : valA ?? '';
        valB = typeof valB === 'string' ? valB.toLowerCase() : valB ?? '';
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [customers, search, sortField, sortOrder]);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Customers" 
        description="View and manage all active customers"
      />

      <div className="border rounded-lg p-4 bg-white dark:bg-zinc-950 shadow-sm space-y-4">
        <FilterBar onReset={() => setSearch('')}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search customers by name, email or phone..." />
        </FilterBar>

        <CustomerTable 
          data={sortedAndFilteredData}
          isLoading={isLoading || isFetching}
          page={page}
          limit={limit}
          total={customers.length} // Local total since API doesn't provide total count yet
          onPageChange={setPage}
          onLimitChange={() => {}} // Limit is fixed at 200
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
      </div>
    </div>
  );
};
