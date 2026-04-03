export interface User {
  id: number;
  login_id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  role_id: number;
  role_code?: string;
  role_description?: string;
  is_active: number; // 1 for Yes, 0 for No
  created_on: string;
  updated_on: string | null;
  reporting_manager_id?: number | null;
<<<<<<< HEAD
  active_leads?: number;
  em_count?: number;
=======
  reportee_count?: number;
>>>>>>> 6b8878b0ddf1abe4aac16d2838d09e24c730b733
}

export interface CreateUserRequest {
  login_id: string;
  password?: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  role_id: number;
  reporting_manager_id?: number | null;
}

export interface CreateUserResponse {
  success: boolean;
  message?: string;
  data?: User;
}

export interface GetUsersRequest {
  role_id?: number;
  offset?: number;
  limit?: number;
  search?: string;
}

export interface GetUsersResponse {
  users: User[];
  total: number;
}
