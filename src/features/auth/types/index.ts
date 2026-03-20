export interface LoginRequest {
  login_id: string;
  password?: string;
}

export interface LoginResponse {
  id: number;
  login_id: string;
  first_name: string;
  last_name: string;
  role_id: number;
  is_first_login: number; // 0 or 1
  token: string;
  refreshToken: string;
}

export interface UpdatePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface UpdatePasswordResponse {
  success: boolean;
}

export interface Role {
  id: number;
  code: string;
  description: string;
  role_level: number;
}

export type RoleCode = 'SADMIN' | 'ADMIN' | 'RELMNG' | 'EXPMNG';

export interface GetUserRolesRequest {
  offset: number;
}
