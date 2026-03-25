export interface Lead {
  uuid: string;
  lead_id: number;
  customer_uuid: string;
  project_id: number;
  source_id: number;
  source_employee_user_id: number | null;
  lead_status_id: number;
  lead_priority_id: number;
  assigned_to_rm: number | null;
  assigned_to_em: number | null;
  is_active: number;
  created_by: number;
  created_on: string;
  updated_by: number | null;
  updated_on: string | null;
  phone_number: string;
  // Additional fields from registration/edit payload
  first_name?: string;
  last_name?: string;
  email_address?: string;
  occupation?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
}

export interface CreateLeadRequest {
  lead_status_id: number;
  lead_priority_id: number;
  source_id: number;
  project_id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  email_address: string;
  source_employee_user_id: number | null;
  assigned_to_rm: number | null;
  assigned_to_em: number | null;
  occupation: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zip: string;
}

export interface UpdateLeadRequest extends CreateLeadRequest {
  uuid: string;
}

export interface GetLeadsRequest {
  status?: number[];
  project?: number[];
  rm?: number[];
  em?: number[];
  search_text?: string;
  is_rm_assigned?: number;
  offset: number;
}

export interface GetLeadsResponse extends Array<Lead> {}
