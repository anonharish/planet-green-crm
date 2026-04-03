import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface TabFilterState {
  page: number;
  limit: number;
  search: string;
  statusIds: string[];
  projectIds: string[];
  rmIds: string[];
  emIds: string[];
  sortField: string;
  sortOrder: 'asc' | 'desc';
  selectedUuids: string[];
}

const initialTabState: TabFilterState = {
  page: 1,
  limit: 20,
  search: '',
  statusIds: [],
  projectIds: [],
  rmIds: [],
  emIds: [],
  sortField: 'customer_name',
  sortOrder: 'asc',
  selectedUuids: [],
};

interface LeadsState {
  activeTab: number; // 0 for Unassigned, 1 for Assigned
  // We use string keys for the record to handle the tab numbers and any "all" view
  tabFilters: Record<string, TabFilterState>;
}

const initialState: LeadsState = {
  activeTab: 0,
  tabFilters: {
    '0': { ...initialTabState },
    '1': { ...initialTabState },
    'all': { ...initialTabState },
  },
};

const leadsSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<number>) => {
      state.activeTab = action.payload;
    },
    updateTabFilters: (state, action: PayloadAction<{ tabKey: string; updates: Partial<TabFilterState> }>) => {
      const { tabKey, updates } = action.payload;
      if (state.tabFilters[tabKey]) {
        state.tabFilters[tabKey] = { ...state.tabFilters[tabKey], ...updates };
      }
    },
    resetTabFilters: (state, action: PayloadAction<string>) => {
      const tabKey = action.payload;
      state.tabFilters[tabKey] = { ...initialTabState };
    },
    toggleLeadSelection: (state, action: PayloadAction<{ tabKey: string; uuid: string }>) => {
      const { tabKey, uuid } = action.payload;
      const filters = state.tabFilters[tabKey];
      if (filters) {
        if (filters.selectedUuids.includes(uuid)) {
          filters.selectedUuids = filters.selectedUuids.filter(id => id !== uuid);
        } else {
          filters.selectedUuids.push(uuid);
        }
      }
    },
    setSelectedUuids: (state, action: PayloadAction<{ tabKey: string; uuids: string[] }>) => {
      const { tabKey, uuids } = action.payload;
      if (state.tabFilters[tabKey]) {
        state.tabFilters[tabKey].selectedUuids = uuids;
      }
    },
  },
});

export const { 
  setActiveTab, 
  updateTabFilters, 
  resetTabFilters, 
  toggleLeadSelection,
  setSelectedUuids 
} = leadsSlice.actions;

export default leadsSlice.reducer;