export interface MasterDataItem {
  id: number;
  code: string;
  description: string;
}

export interface UserRole extends MasterDataItem {
  role_level: number;
}

export interface MasterDataResponse {
  customer_statuses: MasterDataItem[];
  lead_priorities: MasterDataItem[];
  lead_statuses: MasterDataItem[];
  projects: MasterDataItem[];
  sources: MasterDataItem[];
  user_roles: UserRole[];
  site_visit_status: MasterDataItem[];
}
