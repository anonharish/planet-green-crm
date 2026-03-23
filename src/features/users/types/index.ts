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
}

export interface CreateUserRequest {
  login_id: string;
  password?: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  role_id: number;
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
