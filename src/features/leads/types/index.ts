export interface LeadRemark {
  id: number;
  activity_type: string;
  remark: string;
  created_on: string;
}

export interface LeadCall {
  id: number;
  lead_uuid: string;
  from_number: string | null;
  to_number: string | null;
  call_duration_in_seconds: number | null;
  call_summary: string | null;
  call_recording_location: string | null;
  call_remarks: string | null;
  caller_user_id: number | null;
  caller_role_id: number | null;
  call_s3_data: string | null;
  is_active: number;
  created_by: number;
  created_on: string;
  updated_by: number | null;
  updated_on: string | null;
}

export interface LeadVisit {
  id: number;
  lead_uuid: string;
  visit_location_url: string | null;
  visit_date_time: string | null;
  visit_remarks: string | null;
  visit_status: number;
  visit_assigned_to_rm: number | null;
  visit_assigned_to_em: number | null;
  is_active: number;
  created_by: number;
  created_on: string;
  updated_by: number | null;
  updated_on: string | null;
}

export interface LeadChat {
  id: number;
  lead_uuid: string;
  chat_summary: string | null;
  chat_file_location: string | null;
  is_active: number;
  created_by: number;
  created_on: string;
  updated_by: number | null;
  updated_on: string | null;
}

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
  junk_reason?: string;
  customer_status_id?: number;
  remarks?: LeadRemark[];
  calls?: LeadCall[];
  visits?: LeadVisit[];
  chats?: LeadChat[];
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
  junk_reason?: string;
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
  is_em_assigned?: number;
  offset: number;
}

export type GetLeadsResponse = Lead[];

export interface GetCustomerLeadsRequest {
  customer_uuid: string;
  offset: number;
}

export interface GetLeadByIdRequest {
  uuid: string;
}

export interface ScheduleVisitRequest {
  lead_uuid: string;
  visit_location_url: string;
  visit_date_time: string;
  visit_remarks?: string;
  visit_status: number;
  visit_assigned_to_rm: number;
  visit_assigned_to_em: number;
}

export interface GetLeadsByRmIdRequest {
  assigned_to_rm: number;
  offset: number;
  is_em_assigned: number;
}

export interface GetLeadsByEmIdRequest {
  assigned_to_em: number;
  offset: number;
}

export interface AddLeadActivityRequest {
  lead_uuid: string;
  remark: string;
  activity_type: string;
}